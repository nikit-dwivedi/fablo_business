const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://fablo:Fab2020@cluster0.tdvg3.mongodb.net/Administrator').then(() => {
    console.log('mongodb initialized...');
});