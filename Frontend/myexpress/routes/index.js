import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET operators page. */
router.get('/operators', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../public/operators.html'));
});

/* GET operator detail page. */
router.get('/operator/:id', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../public/operator.html'));
});

export default router;
