/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const conn = require("./../db");
const { ObjectID } = require("mongodb");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  //  Each test should completely test the response of the API end-point including response status code!

  suite("Routing tests", function () {
    suite(
      "POST /api/books with title => create book object/expect book object",
      function () {
        test("Test POST /api/books with title", async () => {
          const res = await chai
            .request(server)
            .post("/api/books")
            .send({ title: "Book 001" });
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.equal(res.body.title, "Book 001");
          assert.isArray(res.body.comments);
          assert.isEmpty(res.body.comments);
          assert.property(res.body, "_id");
          assert.property(res.body, "comments");
        });

        test("Test POST /api/books with no title given", async () => {
          const res = await chai.request(server).post("/api/books");
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.isEmpty(res.body);
          assert.equal(res.text, "missing required field title");
        });
      }
    );

    suite("GET /api/books => array of books", function () {
      test("Test GET /api/books", async () => {
        const res = await chai.request(server).get("/api/books");
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isNotEmpty(res.body);
        assert.property(res.body[0], "_id");
        assert.property(res.body[0], "title");
        assert.property(res.body[0], "commentcount");
      });
    });

    suite("GET /api/books/[id] => book object with [id]", () => {
      test("Test GET /api/books/[id] with id not in db", async () => {
        const res = await chai.request(server).get("/api/books/5");
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.isEmpty(res.body);
        assert.equal(res.text, "no book exists");
      });

      test("Test GET /api/books/[id] with valid id in db", async () => {
        const books = (await conn).db("main").collection("books");
        const book = await books.findOne();
        const res = await chai.request(server).get(`/api/books/${book._id}`);
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.isNotEmpty(res.body);
        assert.isArray(res.body.comments);
        assert.isEmpty(res.body.comments);
        assert.property(res.body, "_id");
        assert.property(res.body, "title");
        assert.property(res.body, "comments");
        assert.equal(res.body._id, book._id);
        assert.equal(res.body.title, "Book 001");
      });
    });

    suite(
      "POST /api/books/[id] => add comment/expect book object with id",
      function () {
        test("Test POST /api/books/[id] with comment", async () => {
          const books = (await conn).db("main").collection("books");
          const book = await books.findOne();
          const res = await chai
            .request(server)
            .post(`/api/books/${book._id}`)
            .send({ comment: "Comment 001" });
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.isNotEmpty(res.body);
          assert.isArray(res.body.comments);
          assert.isNotEmpty(res.body.comments);
          assert.equal(res.body.comments[0], "Comment 001");
        });
        test("Test POST /api/books/[id] without comment field", async () => {
          const books = (await conn).db("main").collection("books");
          const book = await books.findOne();
          const res = await chai.request(server).post(`/api/books/${book._id}`);
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.isEmpty(res.body);
          assert.equal(res.text, "missing required field comment");
        });
        test("Test POST /api/books/[id] with comment, id not in db", async () => {
          const res = await chai
            .request(server)
            .post("/api/books/5")
            .send({ comment: "Comment 001" });
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.isEmpty(res.body);
          assert.equal(res.text, "no book exists");
        });
      }
    );

    suite("DELETE /api/books/[id] => delete book object id", function () {
      test("Test DELETE /api/books/[id] with valid id in db", async () => {
        const books = (await conn).db("main").collection("books");
        const book = await books.findOne();
        const res = await chai.request(server).delete(`/api/books/${book._id}`);
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.text, "delete successful");
      });

      test("Test DELETE /api/books/[id] with  id not in db", async () => {
        const res = await chai.request(server).delete("/api/books/5");
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.text, "no book exists");
      });
    });
  });
});
