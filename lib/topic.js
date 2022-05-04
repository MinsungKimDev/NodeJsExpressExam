const url = require('url');
const qs = require('querystring');
const db = require("./db");
const template = require("./template");
const sanitizeHTML = require('sanitize-html');

exports.home = function(req, res){
    db.query(`SELECT * FROM topic`, function(err, topics){
        if(err) throw err;
        const title = 'Welcome';
        const description = "Hello, Node.js";
        const list = template.list(topics);
        const html = template.html(title, list, 
          `<h2>${title}</h2>${description}`,
          `<a href="/create">create</a>`);
        res.send(html);
    });
}

exports.page = function(req, res){
    db.query(`SELECT * FROM topic`, function(err, topics){
        if (err) throw err;
        db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=? `, [req.params.pageId], function(err2, topic){
          if(err2) throw err2;
          const title = topic[0].title;
          const description = topic[0].description;
          const list = template.list(topics);
          const html = template.html(title, list, 
            `<h2>${sanitizeHTML(title)}</h2>
            ${sanitizeHTML(description)}
            <p>by ${sanitizeHTML(topic[0].name)}</p>`,
            ` <a href="/create">create</a>
              <a href="/update/${req.params.pageId}">update</a>
              <form action="delete_process" method="post">
                <input type="hidden", name="id" value="${req.params.pageId}">
                <input type="submit", value="delete">
              </form>
            `);
          res.send(html);
        });
    });
}

exports.create = function(req, res){
    db.query(`SELECT * FROM topic`, function(err, topics){
        if (err) throw err;
        db.query(`SELECT * FROM author`, function(err2, authors){
          if (err2) throw err2
          const title = 'Welcome';
          const list = template.list(topics);
          const html = template.html(title, list, `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="Please write a title"></p>
            <p>
              <textarea name="description" placeholder="Please write a description" cols="30" rows="10"></textarea>
            </p>
            <p>
              ${template.authorSelect(authors)}
            </p>
            <p>
              <input type="submit" value="확인">
            </p>
          </form>
          `, '');
          res.send(html);
        });
       });
}

exports.create_process = function(req, res){
      let body = '';
      req.on('data', function(data){
        body += data;
      });
      req.on('end', function(){
        const post = qs.parse(body);
        db.query(`
        INSERT INTO topic (title, description, created, author_id) 
          VALUES(?, ?, NOW(), ?);`, [post.title, post.description, post.author], function(err, topics){
            if(err) throw err;
            res.redirect(`/page/${topics.insertId}`)
        });
      });
}

exports.update = function(req, res){
    db.query(`SELECT * FROM topic`, function(err, topics){
        if(err) throw err;
        db.query(`SELECT * FROM topic WHERE id=?`, [req.params.pageId], function(err2, topic){
            if(err2) throw err2;
            db.query(`SELECT * FROM author`, function(err3, authors){
                if(err3) throw err3;
                const list = template.list(topics);
                const html = template.html(topic[0].title, list, 
                `
                <form action="/update_process" method="post">
                    <input type="hidden" name="id" value="${topic[0].id}">
                    <p><input type="text" name="title" placeholder="Please write a title" value="${sanitizeHTML(topic[0].title)}"></p>
                    <p>
                        <textarea name="description" placeholder="Please write a description" cols="30" rows="10">${sanitizeHTML(topic[0].description)}</textarea>
                    </p>
                    <p>
                        ${template.authorSelect(authors, topic[0].author_id)}
                    </p>
                    <p>
                        <input type="submit" value="확인">
                    </p>
                </form>
                `,
                `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`);
                res.send(html);
            });
        });
    });
}

exports.update_process = function(req, res){
    let body = '';
    req.on('data', function(data){
        body += data;
    });
    req.on('end', function(){
        const post = qs.parse(body);
        db.query(`UPDATE topic SET title=?, description=?, author_id=? WHERE id=?`,
          [post.title, post.description, post.author, post.id], function(err, results){
            if(err) throw err;
            res.redirect(`/page/${post.id}`)
        });
    });
}

exports.delete_process = function(req, res){
    let body = '';
    req.on('data', function(data){
        body += data;
    });
    req.on('end', function(){
        const post = qs.parse(body);
        db.query(`DELETE FROM topic WHERE id=?`, [post.id], function(err, result){
          if(err) throw err;
          res.redirect('/');
        });
    });
}