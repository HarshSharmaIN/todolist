//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const date = require(__dirname + "/date.js");
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://Cluster74109:XEVdXU5sclpR@cluster74109.ue32tcy.mongodb.net/todolistDB', {useNewUrlParser: true});

const itemsSchema = {
  itemName: String
};

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
  itemName: "Welcome to ToDo-List."
});

const item2 = new Item({
  itemName: "Hit the + button to add an item to the list."
});

const item3 = new Item({
  itemName: "<-- Click here to delete the item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);
const day = date.getDate();

app.get("/", function (req, res) {

  Item.find({}).then(foundItems => {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems);
    }

    res.render("list", { listTitle: day, newListItems: foundItems });
  });
});

app.post("/", function (req, res) {

  const listItem = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    itemName: listItem
  });

  if(listName === day) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}).then(foundList=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === day) {
    Item.findByIdAndRemove(checkedItemId).catch(err => {
      console.log(err);
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(foundList=>{
      res.redirect("/"+listName);
    })
  }
  
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }).then((results) => {
    if (!results) {
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
    } else {
      res.render("list", {listTitle: results.name, newListItems: results.items});
    }
  }).catch(err => {
    console.log(err);
  })

});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
