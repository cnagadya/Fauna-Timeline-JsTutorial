'use strict';

var faunadb = require("faunadb"),
    q = faunadb.query,
    client = new faunadb.Client({ secret: 'YOUR_FAUNADB_ADMIN_SECRET' }),
    db_name = "car_dealers",
    db_role = "server",
    class_name = "cars",
    index_name = "cars_index",
    instance_data = { model: "mustang", license: "EATMYDUST", price: 40000 },
    new_instance_data = { license: "ATETHEDUST",price: 50000 },
    insert_ts = Math.floor((new Date()).getTime()/ 1000),
    resurrect_ts = insert_ts + 1,
    reference,new_instance,update_ref;

client.query(
q.Do(
  // Check if db named "car_dealer" exists else create it
  q.If(q.Exists(q.Database(db_name)), "exists", q.CreateDatabase({ name : db_name })), 
  { 
    //create a new "car_dealer_db" key
    secret : q.Select("secret", q.CreateKey({ database: q.Database(db_name), role: db_role })) 
  })
)
.then(function(data) {
  // Set client secret to the "car_dealer" key
  client = new faunadb.Client({ secret: data.secret });
  
  // ==============Set Up ======================

  // Create cars class
  return client.query(
    // Check if "cars" exists in "car_dealer" else create it
    q.If(q.Exists(q.Class(class_name)), "exists", q.CreateClass({ name: class_name })))
})
.then(function() {
  // Create Mustang Incidence
  return client.query(
    q.Do(
      q.If(q.Exists(q.Index(index_name)), "Index exists",  q.CreateIndex({ 
        name: index_name, 
        source: q.Class(class_name)
      })),
      q.Create(q.Class(class_name), { data: instance_data })
  )
  )  
})
.then(function(instance) {
  reference = "classes/cars/" + instance.ref.id;
  console.log("\n \n ============ New instance created ================");
  console.log("✓ New car instance with model: " + 
    instance.data.model + ", license: " + instance.data.license +
    " and price: " + instance.data.price + " created.");
  
  // Update the instance
  return client.query(
    q.Update(q.Ref(reference), { data: new_instance_data }))
})
.then(function(data){
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

  // Get Events
  return client.query(
    q.Paginate(q.Ref(reference), { events: true }))
})
.then(function(events){
  // ==============View History======================
  // view events
  console.log("\n \n ============View of Events================");
  console.log("\nPulls raw events\n");
  console.log(Object.values(events)[0]);

  // Get Past Data
  return client.query(
    q.Map(
      q.Paginate(
        q.Ref(reference), { events: true }
      ),
      function(event) {
        return q.Get(q.Select("resource", event), q.Select("ts", event));
      }
    )
  )
})
.then(function(events){
  console.log("\n ============ View Past Data================");
  console.log("\nPulls the version of the document associated with the events\n");
  console.log(Object.values(events)[0]);
           
  //  ===========Changing Events============
  //  Remove Events
  console.log("\n \n ============Removing Event================");
  return client.query(
    q.Remove(
      q.Ref(reference),
      update_ref,
      "create"
    )
  )
})
.then(function() {
  console.log("\nLast event  successfully removed \n");

  // get instance
  return client.query(q.Get(q.Ref(reference))) 
})
.then(function(instance_state){
  console.log("\nInstance State after removing an event");
  console.log(instance_state.data);
                        
  // Insert Events
  return client.query(
    q.Insert(
      q.Ref(reference),
      insert_ts,
      "create",
      q.Let(
        { current: q.Get(q.Ref(reference)) },
        {
          data: {
            model: q.Select(["data", "model"], q.Var("current")),
            license: q.Select(["data", "license"], q.Var("current")),
            price: 30000
          }
        })
    )
  )
})
.then(function(inserted_event) {
  console.log("\n ============Inserted Event================");
  console.log(inserted_event);
  
  // fetch inserted data
  return client.query(
    q.Get(
      q.Ref(reference),
      insert_ts
    ))
})
.then(function(inserted_data) {
  console.log("\n ============ Inserted Event Data================");
  console.log(inserted_data);

  return client.query(
    q.Insert(
      q.Ref(reference), 
      resurrect_ts, 
      "delete", {}
    )
  )
})   
.then(function(data){
  console.log("\n ========== Delete =========");
  console.log("\n Used to indicate that the instance was missing for some time period");
  console.log(data);
  
  return client.query(
    q.Get(
      q.Ref(reference), 
      resurrect_ts 
    )
  )
})  
.then(function(){ })
.catch(function(error){
  console.log("\nThe instance data will not be retrievable at that point until it is created\n");
  console.log(error.message);
})
.then(function () {
  //Change Many Events
  console.log("\n \n==========Changing Many Events=========");
  return client.query(
    q.Foreach(
      q.Paginate(
        q.Ref(reference),
        { events: true }
      ),
      function(event) {
        return q.If(
          q.Equals(q.Select("action", event), "create"),
          q.Insert(
            q.Select("resource", event),
            q.Select("ts", event),
            "create",
            q.Let(
              {
                instance: q.Get(q.Select("resource", event), q.Select("ts", event))
              },
              {
                data: {
                  model: q.Select(["data", "model"], q.Var("instance")),
                  price: q.Select(["data", "price"], q.Var("instance"))
                }
              }
            )
          ),
          null
        )
      })
  )
})     
.then(function(multiple_events) {
  console.log(multiple_events)
})
.catch(function(){
  console.log("\n \n ============Invalid YOUR_FAUNADB_ADMIN_SECRET================");
  console.log("Replace 'YOUR_FAUNADB_ADMIN_SECRET' with the Admin Key generated from your Fauna dashboard")
});
