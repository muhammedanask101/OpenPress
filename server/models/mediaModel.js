const mongoose = require('mongoose');
const { Schema } = mongoose;


const AssetSchema = new Schema({

  key: {
    type: String,
    required: [true, 'Storage key is required'],
    index: true
  },

  url: {
    type: String,
    required: [true, 'URL is required']
  },

  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },

  mimeType: { type: String, trim: true },
  size: { type: Number, default: 0 },
  checksum: { type: String, trim: true },
  usedin: {
    kind: { type: String, trim: true },
    item: { type: Schema.Types.ObjectId }
  },
  derivatives: {
    thumbnailUrl: { type: String },
    smallUrl: { type: String },
    mediumUrl: { type: String }
  },
  storageProvider: { type: String, default: 's3', index: true },
  storageRegion: { type: String },
  deleted: { type: Boolean, default: false, index: true },
  meta: { type: Schema.Types.Mixed }
}, {
  timestamps: true
});


module.exports = mongoose.model('Asset', AssetSchema);
