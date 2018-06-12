
var faunadb = require("faunadb"),
  q = faunadb.query,
  client = new faunadb.Client({ secret:  'YOUR_FAUNADB_ADMIN_SECRET' }),
  db_name = "car_dealers",
  db_role = "server",
  class_name = "cars"
  instance_data = { model: "mustang", license: "EATMYDUST", price: 40000 },
  new_instance_data = { license: "EATrfMYDUST",price: 50000 };
  
client.query(
  q.Do(
    // Check if db named "car_dealer" exists else create it
    q.If(q.Exists(q.Database(db_name)),"exists", q.CreateDatabase({ name : db_name })),
    
    //create a new "car_dealer" key
    {
      secret : q.Select("secret", q.CreateKey({ database: q.Database(db_name), role: db_role }))
    }
  ),
).then(function(data) {
  // Set client secret to the "car_dealer" key
  client = new faunadb.Client({ secret: data.secret });
  
  // ==============Set Up ======================
  
  // Create cars class
  
  client.query(
      // Check if "cars" exists in "car_dealer" else create it
    q.If(q.Exists(q.Class(class_name)),"exists", q.CreateClass({ name: class_name }))
    ).then(
    function(){
      // Create Mustang Incidence
  client.query(q.Create(q.Class(class_name),{ data: instance_data})).then(
    function(instance){
      console.log("\n \n ============New instance created================")
      console.log("✓ New car instance with model: " + 
                  instance.data.model + ", license: " + instance.data.license +
                  " and price: " + instance.data.price + " created.")
    
    // Update the instance
    client.query(
      q.Update(
        q.Ref("classes/cars/" + instance.ref.id),
        { data: new_instance_data})).then(
          function(data){
            new_instance = data.data;
            console.log("\n \n ============" + class_name + " instance updated================")
            console.log("↑ Instance details updated to: ");
            for (var key in new_instance) {
              if (new_instance.hasOwnProperty(key)) {
                  console.log(key + " -> " + new_instance[key]);
              }
          }
          // ==============View History======================
          // View Events
          client.query(
            q.Paginate(
              q.Ref("classes/cars/" + instance.ref.id), {events: true})).then(
                function(data){
                  console.log("\n \n ============View of Events================")
                  console.log(data);
                  // var events=Object.values(data)[0];
                  // count = 1;
                  // for (index in events){
                  //   console.log("Event " + count);
                  //   console.log(events[index])
                  //   count++
                  // }
                  ;
                });

          // View Past Data
          client.query(
            q.Map(
              q.Paginate(
                q.Ref("classes/cars/" + instance.ref.id),
                { events: true }),
              function(event) {
                return q.Get(q.Select("resource", event), q.Select("ts", event));
              })).then(function(data){
                console.log("\n \n ============View Past Data================")
                console.log(data)
              });;
          }
      );

    

    });
  
    })


}).catch(function(error){
  console.log("\n \n ============Invalid YOUR_FAUNADB_ADMIN_SECRET================");
  console.log("Replace 'YOUR_FAUNADB_ADMIN_SECRET' with the Admin Key generated from your Fauna dashboard")
});
