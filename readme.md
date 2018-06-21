# Fauna Timeline tutorial | Javascript

In this tutorial, we will model a car dealer that keeps track of each car’s model, license plate, and price. To do this, we will:
- [x] Create a _car dealer_ top level database
- [x] Create _car class_ within car dealer
- [x] Create, edit and delete _instances_ within the _car class_ and view the associated events

## Getting started

1. Install [Node.js](https://nodejs.org/en/download/)

2. Clone this repo

    ```$ git clone https://github.com/cnagadya/Fauna-Timeline-JsTutorial.git```

3. Change directory to the tutorial's  root directory

    ```$ cd Fauna-Timeline-JsTutorial```

4. Install all the dependencies

    ```$ npm install```

## Running the queries

1. Create a new cloud key via [this link](https://fauna.com/account/keys)
2. Replace the _'YOUR_FAUNADB_ADMIN_SECRET'_ value on [line 5](https://github.com/cnagadya/Fauna-Timeline-JsTutorial/blob/master/timeline.js#L5) in index.js with your generated key.
3. Run the queries

    ```$ npm start```

4. If the queries are successful executed:

- On your [Fauna dashboard](https://dashboard.fauna.com/db/classes/cars), you will see the *car_dealers* dashboard with a class *cars*. To view your instances, click the _Browse Class_ link at the top of the content area.

- The output below , will be displayed to your console

``` ============ New instance created ================
✓ New car instance with model: mustang, license: EATMYDUST and price: 40000 created.


 ============cars instance updated================
↑ Instance details updated to:
1529318524592123
model -> mustang
license -> ATETHEDUST
price -> 50000


 ============View of Events================

Pulls raw events

[ { ts: 1529318523585692,
    action: 'create',
    instance:
     Ref(id=202437740337299972, class=Ref(id=cars, class=Ref(id=classes))),
    data: { model: 'mustang', license: 'EATMYDUST', price: 40000 } },
  { ts: 1529318524592123,
    action: 'update',
    instance:
     Ref(id=202437740337299972, class=Ref(id=cars, class=Ref(id=classes))),
    data: { license: 'ATETHEDUST', price: 50000 } } ]
(node:78699) [DEP0079] DeprecationWarning: Custom inspection function on Objects via .inspect() is deprecated

 ============ View Past Data================

Pulls the version of the document associated with the events

[ { ref:
     Ref(id=202437740337299972, class=Ref(id=cars, class=Ref(id=classes))),
    ts: 1529318523585692,
    data: { model: 'mustang', license: 'EATMYDUST', price: 40000 } },
  { ref:
     Ref(id=202437740337299972, class=Ref(id=cars, class=Ref(id=classes))),
    ts: 1529318524592123,
    data: { model: 'mustang', license: 'ATETHEDUST', price: 50000 } } ]


 ============Removing Event================

Event  successfully removed


Instance State after removing an event
{ model: 'mustang', license: 'EATMYDUST', price: 40000 }

 ============Inserted Event================
{ ts: 1529318520,
  action: 'create',
  instance:
   Ref(id=202437740337299972, class=Ref(id=cars, class=Ref(id=classes))),
  data: { model: 'mustang', license: 'EATMYDUST', price: 30000 } }

 ============ Inserted Event Data================
{ ref:
   Ref(id=202437740337299972, class=Ref(id=cars, class=Ref(id=classes))),
  ts: 1529318520,
  data: { model: 'mustang', license: 'EATMYDUST', price: 30000 } }

 ========== Delete =========

 Used to indicate that the instance was missing for some time period
{ ts: 1529318521,
  action: 'delete',
  instance:
   Ref(id=202437740337299972, class=Ref(id=cars, class=Ref(id=classes))),
  data: null }

The instance data will not be retrievable at that point until it is created

instance not found


==========Changing Many Events=========
{ data:
   [ { ts: 1529318520,
       action: 'create',
       instance:
        Ref(id=202437740337299972, class=Ref(id=cars, class=Ref(id=classes))),
       data: [Object] },
     { ts: 1529318521,
       action: 'delete',
       instance:
        Ref(id=202437740337299972, class=Ref(id=cars, class=Ref(id=classes))),
       data: null },
     { ts: 1529318523585692,
       action: 'create',
       instance:
        Ref(id=20243774033729
```
