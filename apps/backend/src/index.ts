import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8000;

app.get('/api', (req, res) => {
  res.send('Backend is running!');
});

app.listen(PORT, () => {
  console.log(
    `  ✅ Server Api Running... \n  ➜  [API] 🚀 Local: http://localhost:${PORT}`
  );
});
