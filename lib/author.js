const db = require("./db");
const template = require("./template");
const qs = require('querystring');
const sanitizeHTML = require('sanitize-html');

exports.home = function(req, res){
    db.query(`SELECT * FROM topic`, function(err, topics){
        if(err) throw err;
        db.query(`SELECT * FROM author`, function(err2, authors){
            if(err2) throw err2;
            const title = 'Author';
            const list = template.list(topics);
            const html = template.html(title, list, 
            `
            ${template.authorTable(authors)}
            <style>
                table{
                    border-collapse: collapse;
                }
                td{
                    border: 1px solid black;
                }
            </style>
            <form action="/author/create_process" method="post">
                <p>
                    <input type="text" name="name" placeholder="name">
                </p>
                <p>
                    <textarea name="profile" place holdeer="profile.."></textarea>
                </p>
                <p>
                    <input type="submit" value="create">
                </p>
            </form>
            `, ``);
            res.send(html);
        })
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
        INSERT INTO author (name, profile) 
          VALUES(?, ?);`, [post.name, post.profile], function(err, topics){
            if(err) throw err;
            res.redirect('/author');
        });
      });
}

exports.update = function(req, res){
    db.query(`SELECT * FROM topic`, function(err, topics){
        if(err) throw err;
        db.query(`SELECT * FROM author`, function(err2, authors){
            if(err2) throw err2;
            db.query(`SELECT * FROM author WHERE id=?`, [req.params.authorId], function(err3, author){
                if(err3) throw err3;
                const title = 'Author';
                const list = template.list(topics);
                const html = template.html(title, list, 
                `
                ${template.authorTable(authors)}
                <style>
                    table{
                        border-collapse: collapse;
                    }
                    td{
                        border: 1px solid black;
                    }
                </style>
                <form action="/author/update_process" method="post">
                    <p>
                        <input type="hidden" name="id" value="${req.params.authorId}">
                    </p>
                    <p>
                        <input type="text" name="name" value="${sanitizeHTML(author[0].name)}">
                    </p>
                    <p>
                        <textarea name="profile">${sanitizeHTML(author[0].profile)}</textarea>
                    </p>
                    <p>
                        <input type="submit" value="update">
                    </p>
                </form>
                `, ``);
                res.send(html)
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
        db.query(`UPDATE author SET name=?, profile=? WHERE id=?`,
            [post.name, post.profile, post.id], 
            function(err, results){
            if(err) throw err;
            res.redirect('/author')
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
        db.query(`DELETE FROM topic WHERE author_id=?`, [post.id], function(err, result){
            if(err) throw err
            db.query(`DELETE FROM author WHERE id=?`, [post.id], function(err2, result){
                if(err2) throw err2;
                res.redirect('/author');
              });
        });
    });
}