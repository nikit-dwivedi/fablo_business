const mongoose = require('mongoose');

mongoose.connect('').then(() => {
    console.log('mongodb initialized...');
});
