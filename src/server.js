import express from 'express';
import sql from 'sqlite3';

const sqlite3 = sql.verbose();

// create database
const db = new sqlite3.Database(':memory:');

// create todo table
db.run(`CREATE TABLE todo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL
)`);

const app = express();
app.use(express.static('public'));
app.set('views', 'views');
app.set('view engine', 'pug');
app.use(express.urlencoded({ extended: false }));

// render main page with todo items
app.get('/', function (req, res) {
    const local = { tasks: [] };

    db.all('SELECT id, task FROM todo', function (err, rows) {
        if (err) {
            console.log(err);
            return res.status(500).send('Error retrieving tasks');
        }
        
        rows.forEach(row => {
            local.tasks.push({ id: row.id, task: row.task });
        });

        res.render('index', local);
    });
});

// adding a new todo item
app.post('/add', (req, res) => {
    const task = req.body.todo;
    const stmt = db.prepare('INSERT INTO todo (task) VALUES (?)');

    stmt.run(task, function (err) {
        if (err) {
            console.error(err);
            return res.status(500).send('Error adding todo item');
        }

        const newTask = { id: this.lastID, task };

        // check if AJAX request
        if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
            res.json(newTask);
        } else {
            res.redirect('/');
        }
    });
    stmt.finalize();
});

// deleting a todo item
app.post('/delete', (req, res) => {
    const id = req.body.id;

    const stmt = db.prepare('DELETE FROM todo WHERE id = ?');
    stmt.run(id, function (err) {
        if (err) {
            console.error(err);
            return res.status(500).send('Error deleting todo item');
        }

        // check if AJAX request
        if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
            res.json({ success: true });
        } else {
            res.redirect('/');
        }
    });
    stmt.finalize();
});

// start web server
app.listen(3000, function () {
    console.log('Listening on port 3000...');
});