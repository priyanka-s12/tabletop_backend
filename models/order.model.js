const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: true,
    },
    selectedItems: [
      {
        menuId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
        quantity: Number,
      },
    ],
    totalAmount: Number,
    status: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

const OrderData = mongoose.model('OrderData', orderSchema);
module.exports = OrderData;
