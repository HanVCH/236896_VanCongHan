const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Food = require('./models/Food');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Ket noi MongoDB Atlas thanh cong!'))
  .catch((err) => console.error('Loi ket noi MongoDB Atlas:', err));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend API dang hoat dong binh thuong' });
});

app.get('/api/foods', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { cuisine: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const foods = await Food.find(query);
    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({ message: 'Loi may chu', error: error.message });
  }
});

app.get('/api/foods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let food;

    if (mongoose.Types.ObjectId.isValid(id)) {
      food = await Food.findById(id);
    }
    if (!food) {
      food = await Food.findOne({ foodId: id });
    }

    if (!food) {
      return res.status(404).json({ message: 'Khong tim thay mon an' });
    }

    res.status(200).json(food);
  } catch (error) {
    res.status(500).json({ message: 'Loi may chu', error: error.message });
  }
});

app.post('/api/foods', async (req, res) => {
  try {
    const { foodId, name, category, cuisine, ingredients, price, quantity, description, imageUrl } = req.body;

    if (!foodId || !name || !category || !cuisine || price === undefined || quantity === undefined) {
      return res.status(400).json({ message: 'Vui long nhap day du cac truong bat buoc' });
    }

    const existingFood = await Food.findOne({ foodId });
    if (existingFood) {
      return res.status(400).json({ message: 'Ma mon an (foodId) da ton tai' });
    }

    const newFood = new Food({
      foodId,
      name,
      category,
      cuisine,
      ingredients: ingredients || [],
      price,
      quantity,
      description: description || '',
      imageUrl: imageUrl || ''
    });

    const savedFood = await newFood.save();
    res.status(201).json(savedFood);
  } catch (error) {
    res.status(500).json({ message: 'Loi may chu', error: error.message });
  }
});

app.put('/api/foods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let filter = {};

    if (mongoose.Types.ObjectId.isValid(id)) {
      filter = { _id: id };
    } else {
      filter = { foodId: id };
    }

    const updatedFood = await Food.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });

    if (!updatedFood) {
      return res.status(404).json({ message: 'Khong tim thay mon an de cap nhat' });
    }

    res.status(200).json(updatedFood);
  } catch (error) {
    res.status(500).json({ message: 'Loi may chu', error: error.message });
  }
});

app.delete('/api/foods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let filter = {};

    if (mongoose.Types.ObjectId.isValid(id)) {
      filter = { _id: id };
    } else {
      filter = { foodId: id };
    }

    const deletedFood = await Food.findOneAndDelete(filter);

    if (!deletedFood) {
      return res.status(404).json({ message: 'Khong tim thay mon an de xoa' });
    }

    res.status(200).json({ message: 'Xoa mon an thanh cong', food: deletedFood });
  } catch (error) {
    res.status(500).json({ message: 'Loi may chu', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server dang chay tai port ${PORT}`);
});