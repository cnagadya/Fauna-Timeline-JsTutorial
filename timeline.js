'use strict';

var faunadb = require("faunadb"),
  q = faunadb.query,
  client = new faunadb.Client({ secret:  'YOUR_FAUNADB_ADMIN_SECRET' }),
  db_name = "car_dealers",
  db_role = "server",
  class_name = "cars",
  reference,
  instance_data = { model: "mustang", license: "EATMYDUST", price: 40000 },
  new_instance_data = { license: "ATETHEDUST",price: 50000 },
  insert_ts=Math.floor((new Date()).getTime()/ 1000),
  resurrect_ts = insert_ts + 1;

client.query(
  q.Do(
    // Check if db named "car_dealer" exists else create it
    q.If(q.Exists(q.Database(db_name)),"exists", q.CreateDatabase({ name : db_name })),
    
    //create a new "car_dealer" key
    {
      secret : q.Select("secret", q.CreateKey({ database: q.Database(db_name), role: db_role }))
    }
  )).then(function(data) {
  // Set client secret to the "car_dealer" key
  client = new faunadb.Client({ secret: data.secret });
  
  // ==============Set Up ======================
  
  // Create cars class
  return client
}).then(function(client) { 
  client.query(
      // Check if "cars" exists in "car_dealer" else create it
    q.If(q.Exists(q.Class(class_name)),"exists", q.CreateClass({ name: class_name }))
    ).then(
    function(){
      // Create Mustang Incidence
  client.query(q.Create(q.Class(class_name),{ data: instance_data})).then(
    function(instance){
      reference = "classes/cars/" + instance.ref.id;
      console.log("\n \n ============New instance created================")
      console.log("✓ New car instance with model: " + 
                  instance.data.model + ", license: " + instance.data.license +
                  " and price: " + instance.data.price + " created.")
    
    // Update the instance
    client.query(
      q.Update(
        q.Ref(reference),
        { data: new_instance_data})).then(
          function(data){
            new_instance = data.data;
            update_ref = data.ts;
            console.log("\n \n ============" + class_name + " instance updated================")
            console.log("↑ Instance details updated to: ");
            console.log(data.ts);
            for (var key in new_instance) {
              if (new_instance.hasOwnProperty(key)) {
                  console.log(key + " -> " + new_instance[key]);
              }
          }
          // ==============View History======================
          // View Events
          client.query(
            q.Paginate(
              q.Ref(reference), {events: true})).then(
                function(events){
                  console.log("\n \n ============View of Events================");
                  console.log("\nPulls raw events\n");
                  console.log(Object.values(events)[0]);
                });

          // View Past Data
          client.query(
            q.Map(
              q.Paginate(
                q.Ref(reference),
                { events: true }),
              function(event) {
                return q.Get(q.Select("resource", event), q.Select("ts", event));
              })).then(function(events){
                console.log("\n \n ============View Past Data================");
                console.log("\nPulls the version of the document associated with the events\n");
                console.log(Object.values(events)[0]);
             
                //  ===========Changing Events============
                //  Remove Events
                client.query(
                  q.Remove(
                    q.Ref(reference),
                    update_ref,
                    "create")).then(function(){
                      console.log("\n \n ============Removing Event================");
                      console.log("\nEvent  successfully removed\n");
                      client.query(q.Get(q.Ref(reference))).then(
                        function(instance_state){
                          console.log("\nInstance State after removing an event");
                          console.log(instance_state.data);
                          
                          // Insert Events
                          client.query(
                            q.Insert(
                              q.Ref(reference), insert_ts, "create",
                              q.Let({ current: q.Get(q.Ref(reference)) },
                                { data: {
                                    model: q.Select(["data", "model"], q.Var("current")),
                                    license: q.Select(["data", "license"], q.Var("current")),
                                    price: 30000}
                                }))).then(function(inserted_event){
                                    console.log("\n \n ============Inserting Event================");
                                    console.log(inserted_event);
                                    client.query(
                                      q.Get(
                                        q.Ref(reference),
                                        insert_ts)).then(function(inserted_data){
                                          console.log("\n \n============ Fetching Inserted Event Data================");
                                          console.log(inserted_data);
                                        });
                                    client.query(
                                      q.Insert(
                                        q.Ref(reference), resurrect_ts, "delete", {} )).then(function(data){
                                          console.log("\n \n==========Delete=========");
                                          console.log("\n Used to indicate that the instance was missing for some time period");
                                          console.log(data);
                                          client.query(
                                            q.Get(
                                              q.Ref(reference), resurrect_ts )).then(
                                                function(){}).catch(function(error){
                                                console.log("\n The instance data will not be retrievable at that point until it is created\n");
                                                console.log(error.message);
                                              })

                                          //Change Many Events
                                          client.query(q.Foreach(
                                            q.Paginate(
                                              q.Ref(reference),
                                              { events: true }),
                                            function(event) {
                                              return q.If(
                                                q.Equals(q.Select("action", event), "create"),
                                                q.Insert(
                                                  q.Select("resource", event),
                                                  q.Select("ts", event),
                                                  "create",
                                                  q.Let(
                                                    {
                                                      instance: q.Get(
                                                        q.Select("resource", event),
                                                        q.Select("ts", event))
                                                    },
                                                    {
                                                      data: {
                                                        model: q.Select(["data", "model"], q.Var("instance")),
                                                        price: q.Select(["data", "price"], q.Var("instance"))
                                                      }
                                                    })),
                                                null);
                                            })).then(function(multiple_events){
                                              console.log("\n \n==========Changing Many Events=========");
                                              console.log(multiple_events);
                                            });
                                            client.query(
                                              q.Map(
                                                q.Paginate(
                                                  q.Ref(reference),
                                                  { events: true }),
                                                function(event) {
                                                  return q.If(
                                                    q.Equals(q.Select("action", event), "create"),
                                                    q.Get(
                                                      q.Select("resource", event),
                                                      q.Select("ts", event)),
                                                    q.Select("ts", event));
                                                })
                                              ).then(function(data){
                                                  console.log("\n\n==========Checking for existence======");
                                                  console.log(data);
                                                });

                                          });
                                  });
                        });
                    });
                });
         });
    });
  
    })


}).catch(function(){
  console.log("\n \n ============Invalid YOUR_FAUNADB_ADMIN_SECRET================");
  console.log("Replace 'YOUR_FAUNADB_ADMIN_SECRET' with the Admin Key generated from your Fauna dashboard")
});
