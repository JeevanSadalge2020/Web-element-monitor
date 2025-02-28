const ElementSchema = new mongoose.Schema(
  {
    pageContextId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PageContext",
      required: [true, "Page context reference is required"],
    },
    name: {
      type: String,
      required: [true, "Element name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // Multiple selectors for resilient element finding
    selectors: {
      xpath: { type: String, trim: true },
      css: { type: String, trim: true },
      id: { type: String, trim: true },
    },
    // Element content and attributes - ENHANCE THESE FIELDS
    content: { type: String },
    attributes: { type: Map, of: String, default: {} },
    position: {
      x: Number,
      y: Number,
      width: Number,
      height: Number,
    },
    // ADD THESE NEW FIELDS
    tagName: { type: String },
    innerHTML: { type: String },
    outerHTML: { type: String },
    classes: [String],
    parent: {
      tagName: String,
      id: String,
      classes: [String],
    },
    // Status information
    status: {
      type: String,
      enum: ["active", "changed", "missing", "error"],
      default: "active",
    },
    lastChecked: {
      type: Date,
    },
    // Store previous states for comparison - UPDATE THIS STRUCTURE TOO
    previousStates: [
      {
        timestamp: Date,
        content: String,
        attributes: { type: Map, of: String },
        position: {
          x: Number,
          y: Number,
          width: Number,
          height: Number,
        },
        tagName: String,
        innerHTML: String,
        outerHTML: String,
        classes: [String],
        parent: {
          tagName: String,
          id: String,
          classes: [String],
        },
        status: String,
        selectorResults: Object,
        selectorDetails: Object,
      },
    ],
  },
  { timestamps: true }
);
