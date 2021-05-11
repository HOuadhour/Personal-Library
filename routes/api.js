/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";
const conn = require("./../db");
const { ObjectID } = require("mongodb");

module.exports = function (app) {
  app
    .route("/api/books")
    .get(async function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      const books = (await conn).db("main").collection("books");
      const booksList = await books
        .aggregate([
          {
            $project: {
              title: 1,
              commentcount: {
                $size: "$comments",
              },
            },
          },
        ])
        .toArray();
      return res.json(booksList);
    })

    .post(async function (req, res) {
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (!title) {
        return res.send("missing required field title");
      }
      const books = (await conn).db("main").collection("books");
      const ins = await books.insertOne({
        title,
        comments: [],
      });
      return res.json(ins.ops[0]);
    })

    .delete(async function (req, res) {
      //if successful response will be 'complete delete successful'
      const books = (await conn).db("main").collection("books");
      const result = (await books.deleteMany()).result;
      if (Boolean(result.ok)) {
        res.send("complete delete successful");
      }
    });

  app
    .route("/api/books/:id")
    .get(async function (req, res) {
      let bookid = req.params.id;
      const books = (await conn).db("main").collection("books");
      try {
        const book = await books.findOne({ _id: ObjectID(bookid) });
        if (book) {
          res.json(book);
        } else {
          res.send("no book exists");
        }
      } catch {
        res.send("no book exists");
      }

      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })

    .post(async function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      const books = (await conn).db("main").collection("books");
      if (!comment) {
        return res.send("missing required field comment");
      }
      try {
        const result = (
          await books.findOneAndUpdate(
            { _id: ObjectID(bookid) },
            { $push: { comments: comment } },
            {
              returnOriginal: false,
            }
          )
        ).value;
        if (result) {
          res.json(result);
        } else {
          res.send("no book exists");
        }
      } catch {
        res.send("no book exists");
      }
      //json res format same as .get
    })

    .delete(async function (req, res) {
      let bookid = req.params.id;
      const books = (await conn).db("main").collection("books");
      try {
        const deleted = (await books.deleteOne({ _id: ObjectID(bookid) }))
          .deletedCount;
        if (deleted == 1) {
          res.send("delete successful");
        } else {
          res.send("no book exists");
        }
      } catch {
        res.send("no book exists");
      }
      //if successful response will be 'delete successful'
    });
};
