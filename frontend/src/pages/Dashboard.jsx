import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Ship,
  CalendarCheck,
  Edit,
  Trash2,
  Upload,
  X,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Search,
  Menu,
  Trash,
} from "lucide-react";

import useAuth from "../stores/auth.store";
import useBoatsStore from "../stores/boats.store";
import useOrdersStore from "../stores/orders.store";

// --- Components ---
// FIX: Memoized TabButton to prevent unnecessary re-renders
const TabButton = React.memo(({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-200 ${
      active
        ? "bg-blue text-white shadow-md"
        : "bg-white text-grey hover:bg-gray-100 border border-gray-200"
    }`}
  >
    <Icon size={20} />
    <span className="hidden sm:inline">{label}</span>
  </button>
));

// FIX: Updated ImageUploader to work with File objects instead of base64
const ImageUploader = ({ onImageSelect, currentImage, error }) => {
  const [preview, setPreview] = useState(currentImage || "");
  const [sizeError, setSizeError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // FIX: Increased size limit to 5MB (matches backend multer config)
    if (file.size > 5 * 1024 * 1024) {
      setSizeError("حجم الصورة يجب أن لا يتجاوز 5 ميجابايت");
      return;
    }
    setSizeError("");

    // FIX: Create preview URL and pass File object to parent
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    onImageSelect(file); // FIX: Pass File object instead of base64

    // FIX: Cleanup preview URL to prevent memory leaks
    return () => URL.revokeObjectURL(previewUrl);
  };

  const removeImage = () => {
    setPreview("");
    onImageSelect(null);
  };

  // FIX: Cleanup preview URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-grey">الصورة *</label>
      <div
        className={`border-2 border-dashed rounded-xl p-4 text-center transition ${
          error ? "border-red" : "border-gray-300"
        }`}
      >
        {preview ? (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Preview"
              className="h-32 w-auto rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red text-white rounded-full p-1 shadow-md"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <label className="cursor-pointer flex flex-col items-center gap-2">
            <Upload className="text-blue" size={32} />
            <span className="text-sm text-grey">
              اضغط لرفع الصورة (حد أقصى 5MB)
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>
      {(sizeError || error) && (
        <p className="text-red text-xs flex items-center gap-1">
          <AlertCircle size={12} />
          {sizeError || error}
        </p>
      )}
    </div>
  );
};

const BoatForm = ({ boat, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: boat?.title || "",
    place: boat?.place || "",
    description: boat?.description || "",
    price1h: boat?.price1h || "",
    price2h: boat?.price2h || "",
    price3h: boat?.price3h || "",
    price4h: boat?.price4h || "",
    capacity: boat?.capacity || "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(boat?.image || "");
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (file) => {
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview("");
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "العنوان مطلوب";
    if (!formData.place.trim()) newErrors.place = "المكان مطلوب";
    if (!formData.description.trim()) newErrors.description = "الوصف مطلوب";
    if (!formData.price1h || formData.price1h <= 0)
      newErrors.price1h = "سعر الساعة الأولى مطلوب";
    if (!formData.price2h || formData.price2h <= 0)
      newErrors.price2h = "سعر الساعتين مطلوب";
    if (!formData.price3h || formData.price3h <= 0)
      newErrors.price3h = "سعر 3 ساعات مطلوب";
    if (!formData.price4h || formData.price4h <= 0)
      newErrors.price4h = "سعر 4 ساعات مطلوب";
    if (!formData.capacity || formData.capacity <= 0)
      newErrors.capacity = "السعة مطلوبة";

    if (!boat?.image && !imageFile) {
      newErrors.image = "الصورة مطلوبة";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        image: imageFile || boat?.image,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-grey mb-1">
          عنوان القارب *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none ${
            errors.title ? "border-red" : "border-gray-300"
          }`}
          placeholder="مثلاً: يخت الفاخرة"
        />
        {errors.title && (
          <p className="text-red text-xs mt-1">{errors.title}</p>
        )}
      </div>

      {/* FIX: Place field */}
      <div>
        <label className="block text-sm font-medium text-grey mb-1">
          مكان القارب *
        </label>
        <select
          name="place"
          value={formData.place}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none ${
            errors.place ? "border-red" : "border-gray-300"
          }`}
        >
          <option value="">اختر المكان</option>
          <option value="ميناء تيبازة">ميناء تيبازة</option>
          <option value="ميناء شرشال">ميناء شرشال</option>
          <option value="القرن الذهبي">القرن الذهبي</option>
        </select>
        {errors.place && (
          <p className="text-red text-xs mt-1">{errors.place}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-grey mb-1">
          الوصف *
        </label>
        <textarea
          name="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none ${
            errors.description ? "border-red" : "border-gray-300"
          }`}
          placeholder="وصف القارب والميزات..."
        />
        {errors.description && (
          <p className="text-red text-xs mt-1">{errors.description}</p>
        )}
      </div>

      {/* FIX: Pricing - 4 fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-grey mb-1">
            سعر الساعة (دج) *
          </label>
          <input
            type="number"
            name="price1h"
            value={formData.price1h}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none ${
              errors.price1h ? "border-red" : "border-gray-300"
            }`}
          />
          {errors.price1h && (
            <p className="text-red text-xs mt-1">{errors.price1h}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-grey mb-1">
            سعر ساعتين (دج) *
          </label>
          <input
            type="number"
            name="price2h"
            value={formData.price2h}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none ${
              errors.price2h ? "border-red" : "border-gray-300"
            }`}
          />
          {errors.price2h && (
            <p className="text-red text-xs mt-1">{errors.price2h}</p>
          )}
        </div>
      </div>

      {/* FIX: Price 3h and 4h */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-grey mb-1">
            سعر 3 ساعات (دج) *
          </label>
          <input
            type="number"
            name="price3h"
            value={formData.price3h}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none ${
              errors.price3h ? "border-red" : "border-gray-300"
            }`}
          />
          {errors.price3h && (
            <p className="text-red text-xs mt-1">{errors.price3h}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-grey mb-1">
            سعر 4 ساعات (دج) *
          </label>
          <input
            type="number"
            name="price4h"
            value={formData.price4h}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none ${
              errors.price4h ? "border-red" : "border-gray-300"
            }`}
          />
          {errors.price4h && (
            <p className="text-red text-xs mt-1">{errors.price4h}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-grey mb-1">
          السعة (عدد الأشخاص) *
        </label>
        <input
          type="number"
          name="capacity"
          value={formData.capacity}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue/20 focus:border-blue outline-none ${
            errors.capacity ? "border-red" : "border-gray-300"
          }`}
        />
        {errors.capacity && (
          <p className="text-red text-xs mt-1">{errors.capacity}</p>
        )}
      </div>

      <ImageUploader
        onImageSelect={handleImageSelect}
        currentImage={imagePreview}
        error={errors.image}
      />

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2 border border-gray-300 rounded-xl text-grey hover:bg-gray-50 transition disabled:opacity-50"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 bg-blue text-white rounded-xl hover:bg-blue/90 transition shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? "جاري الحفظ..." : "حفظ"}
        </button>
      </div>
    </form>
  );
};

// FIX: Updated BoatCard with place display
const BoatCard = React.memo(({ boat, onEdit, onDelete, isDeleting }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 transition hover:shadow-lg">
      <div className="h-48 overflow-hidden">
        <img
          src={boat.image}
          alt={boat.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-xl text-blue mb-1">{boat.title}</h3>
        {/* FIX: Display place */}
        <p className="text-sm text-grey mb-2 flex items-center gap-1">
          📍 {boat.place}
        </p>
        <p className="text-grey text-sm line-clamp-2 mb-3">
          {boat.description}
        </p>
        <div className="flex flex-wrap gap-2 text-sm mb-3">
          <span className="bg-gray-100 px-2 py-1 rounded-full">
            1h: {boat.price1h?.toLocaleString()} دج
          </span>
          <span className="bg-gray-100 px-2 py-1 rounded-full">
            2h: {boat.price2h?.toLocaleString()} دج
          </span>
          <span className="bg-gray-100 px-2 py-1 rounded-full">
            3h: {boat.price3h?.toLocaleString()} دج
          </span>
          <span className="bg-gray-100 px-2 py-1 rounded-full">
            4h: {boat.price4h?.toLocaleString()} دج
          </span>
          <span className="bg-gray-100 px-2 py-1 rounded-full">
            👥 {boat.capacity}
          </span>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => onEdit(boat)}
            disabled={isDeleting}
            className="p-2 text-blue hover:bg-blue/10 rounded-full transition disabled:opacity-50"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => onDelete(boat._id)}
            disabled={isDeleting}
            className="p-2 text-red hover:bg-red/10 rounded-full transition disabled:opacity-50"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
});

// FIX: Updated EditBoatModal with place, price3h, price4h
const EditBoatModal = ({ boat, onClose, onSave, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: boat?.title || "",
    place: boat?.place || "",
    description: boat?.description || "",
    price1h: boat?.price1h || "",
    price2h: boat?.price2h || "",
    price3h: boat?.price3h || "",
    price4h: boat?.price4h || "",
    capacity: boat?.capacity || "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(boat?.image || "");
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (file) => {
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview("");
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "العنوان مطلوب";
    if (!formData.place.trim()) newErrors.place = "المكان مطلوب";
    if (!formData.description.trim()) newErrors.description = "الوصف مطلوب";
    if (!formData.price1h || formData.price1h <= 0)
      newErrors.price1h = "سعر الساعة الأولى مطلوب";
    if (!formData.price2h || formData.price2h <= 0)
      newErrors.price2h = "سعر الساعتين مطلوب";
    if (!formData.price3h || formData.price3h <= 0)
      newErrors.price3h = "سعر 3 ساعات مطلوب";
    if (!formData.price4h || formData.price4h <= 0)
      newErrors.price4h = "سعر 4 ساعات مطلوب";
    if (!formData.capacity || formData.capacity <= 0)
      newErrors.capacity = "السعة مطلوبة";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        ...formData,
        image: imageFile || boat?.image,
      });
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-blue">تعديل القارب</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-grey mb-1">
                عنوان القارب *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-xl ${
                  errors.title ? "border-red" : "border-gray-300"
                }`}
              />
            </div>

            {/* FIX: Place select */}
            <div>
              <label className="block text-sm font-medium text-grey mb-1">
                مكان القارب *
              </label>
              <select
                name="place"
                value={formData.place}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-xl ${
                  errors.place ? "border-red" : "border-gray-300"
                }`}
              >
                <option value="">اختر المكان</option>
                <option value="ميناء تيبازة">ميناء تيبازة</option>
                <option value="ميناء شرشال">ميناء شرشال</option>
                <option value="القرن الذهبي">القرن الذهبي</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-grey mb-1">
                الوصف *
              </label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-xl ${
                  errors.description ? "border-red" : "border-gray-300"
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-grey mb-1">
                  سعر الساعة *
                </label>
                <input
                  type="number"
                  name="price1h"
                  value={formData.price1h}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-xl ${
                    errors.price1h ? "border-red" : "border-gray-300"
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-grey mb-1">
                  سعر ساعتين *
                </label>
                <input
                  type="number"
                  name="price2h"
                  value={formData.price2h}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-xl ${
                    errors.price2h ? "border-red" : "border-gray-300"
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-grey mb-1">
                  سعر 3 ساعات *
                </label>
                <input
                  type="number"
                  name="price3h"
                  value={formData.price3h}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-xl ${
                    errors.price3h ? "border-red" : "border-gray-300"
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-grey mb-1">
                  سعر 4 ساعات *
                </label>
                <input
                  type="number"
                  name="price4h"
                  value={formData.price4h}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-xl ${
                    errors.price4h ? "border-red" : "border-gray-300"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-grey mb-1">
                السعة *
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-xl ${
                  errors.capacity ? "border-red" : "border-gray-300"
                }`}
              />
            </div>

            <ImageUploader
              onImageSelect={handleImageSelect}
              currentImage={imagePreview}
              error={errors.image}
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-2 border border-gray-300 rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-blue text-white rounded-xl"
              >
                {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ... Keep OrdersTable component exactly as is ...
// Updated OrdersTable for real API data
// Updated OrdersTable for real API data
// Updated OrdersTable for real API data
const OrdersTable = ({
  orders,
  loading,
  onUpdateStatus,
  onDeleteOrder,
  onDeleteAllOrders,
}) => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Filter orders based on search and status
  const filtered = orders.filter((order) => {
    const matchesSearch =
      order.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      order.customerPhone?.includes(search) ||
      order.boatName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filtered.map((o) => o._id)); // FIX: Use _id
    }
    setSelectAll(!selectAll);
  };

  const handleSelectOrder = (orderId) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
      setSelectAll(false);
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
      if (selectedOrders.length + 1 === filtered.length) {
        setSelectAll(true);
      }
    }
  };

  const handleDeleteSelected = () => {
    if (selectedOrders.length === 0) return;
    if (
      window.confirm(`هل أنت متأكد من حذف ${selectedOrders.length} حجز(ات)؟`)
    ) {
      onDeleteAllOrders(selectedOrders);
      setSelectedOrders([]);
      setSelectAll(false);
    }
  };

  // Helper to format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("ar-DZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper to get duration text
  const getDurationText = (duration) => {
    const durations = {
      1: "ساعة واحدة",
      2: "ساعتين",
      3: "3 ساعات",
      4: "4 ساعات",
    };
    return durations[duration] || `${duration} ساعات`;
  };

  // Helper to get status badge config
  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        icon: Clock,
        text: "قيد الانتظار",
        className: "bg-yellow-100 text-yellow-700",
      },
      confirmed: {
        icon: CheckCircle,
        text: "مؤكد",
        className: "bg-green-100 text-green-700",
      },
      cancelled: {
        icon: XCircle,
        text: "ملغي",
        className: "bg-red-100 text-red-700",
      },
      completed: {
        icon: CheckCircle,
        text: "مكتمل",
        className: "bg-blue-100 text-blue-700",
      },
    };
    return configs[status] || configs.pending;
  };

  const StatusBadge = ({ status }) => {
    const { icon: Icon, text, className } = getStatusConfig(status);
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${className}`}
      >
        <Icon size={14} /> {text}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1">
          <Search
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-grey/60"
            size={18}
          />
          <input
            type="text"
            placeholder="بحث بالاسم، الهاتف أو القارب..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-xl focus:ring-blue focus:border-blue outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl bg-white"
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="confirmed">مؤكد</option>
            <option value="cancelled">ملغي</option>
            <option value="completed">مكتمل</option>
          </select>

          {selectedOrders.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-4 py-2 bg-red text-white rounded-xl hover:bg-red/90 transition"
            >
              <Trash size={18} />
              حذف ({selectedOrders.length})
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl">
          جاري تحميل الحجوزات...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl">
          لا توجد حجوزات
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium text-grey uppercase">
                  <input
                    type="checkbox"
                    checked={selectAll && filtered.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue focus:ring-blue"
                  />
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-grey uppercase">
                  العميل
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-grey uppercase">
                  الهاتف
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-grey uppercase">
                  القارب
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-grey uppercase">
                  المكان
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-grey uppercase">
                  التاريخ
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-grey uppercase">
                  الوقت
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-grey uppercase">
                  المدة
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-grey uppercase">
                  السعر
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-grey uppercase">
                  الحالة
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-grey uppercase">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filtered.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order._id)}
                      onChange={() => handleSelectOrder(order._id)}
                      className="rounded border-gray-300 text-blue focus:ring-blue"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {order.customerName}
                  </td>
                  <td className="px-4 py-3 text-sm dir-ltr">
                    {order.customerPhone}
                  </td>
                  <td className="px-4 py-3 text-sm">{order.boatName}</td>
                  <td className="px-4 py-3 text-sm">{order.boatPlace}</td>
                  <td className="px-4 py-3 text-sm">
                    {formatDate(order.bookingDate)}
                  </td>
                  <td className="px-4 py-3 text-sm">{order.startTime}</td>
                  <td className="px-4 py-3 text-sm">
                    {getDurationText(order.duration)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {order.totalPrice?.toLocaleString()} دج
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {order.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              onUpdateStatus(order._id, "confirmed")
                            }
                            className="text-green-600 hover:text-green-800"
                            title="تأكيد"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() =>
                              onUpdateStatus(order._id, "cancelled")
                            }
                            className="text-red-600 hover:text-red-800"
                            title="إلغاء"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      {order.status === "confirmed" && (
                        <>
                          <button
                            onClick={() =>
                              onUpdateStatus(order._id, "completed")
                            }
                            className="text-blue-600 hover:text-blue-800"
                            title="مكتمل"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() =>
                              onUpdateStatus(order._id, "cancelled")
                            }
                            className="text-red-600 hover:text-red-800"
                            title="إلغاء"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      {order.status === "cancelled" && (
                        <button
                          onClick={() => onUpdateStatus(order._id, "confirmed")}
                          className="text-green-600 hover:text-green-800"
                          title="إعادة تأكيد"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteOrder(order._id)}
                        className="text-red-600 hover:text-red-800"
                        title="حذف"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// --- Main Dashboard Component ---
const Dashboard = () => {
  const { logout, loading: authLoading } = useAuth();

  // FIX: Use boats store instead of local state and localStorage
  const {
    boats,
    loading: boatsLoading,
    fetchBoats,
    addBoat,
    updateBoat,
    deleteBoat,
  } = useBoatsStore();

  const {
    orders,
    loading: ordersLoading,
    stats,
    pagination,
    fetchOrders,
    updateOrderStatus,
    deleteOrder,
    fetchStats,
  } = useOrdersStore();

  const [activeTab, setActiveTab] = useState("add");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBoat, setSelectedBoat] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // FIX: Local submitting state

  // FIX: Fetch boats from API on mount
  useEffect(() => {
    fetchBoats();
  }, [fetchBoats]);

  useEffect(() => {
    fetchOrders({ page: 1, limit: 50 });
    fetchStats();
  }, [fetchOrders, fetchStats]);

  // FIX: Handle add boat with API
  const handleAddBoat = async (boatData) => {
    setIsSubmitting(true);
    const result = await addBoat(boatData);
    setIsSubmitting(false);

    if (result.success) {
      setActiveTab("boats"); // FIX: Switch to boats tab after successful addition
    }
  };

  const handleEditClick = useCallback((boat) => {
    setSelectedBoat(boat);
    setEditModalOpen(true);
  }, []);

  // FIX: Handle update boat with API
  const handleUpdateBoat = async (updatedBoat) => {
    setIsSubmitting(true);
    const result = await updateBoat(selectedBoat._id, updatedBoat);
    setIsSubmitting(false);

    if (result.success) {
      setEditModalOpen(false);
      setSelectedBoat(null);
    }
  };

  // FIX: Handle delete boat with API
  const handleDeleteBoat = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا القارب؟")) {
      await deleteBoat(id);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus);
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الحجز؟")) {
      await deleteOrder(orderId);
    }
  };

  const handleDeleteAllOrders = async (ids) => {
    if (ids === "all") {
      if (window.confirm("هل أنت متأكد من حذف جميع الحجوزات؟")) {
        for (const order of orders) {
          await deleteOrder(order._id);
        }
      }
    } else {
      if (window.confirm(`هل أنت متأكد من حذف ${ids.length} حجز(ات)؟`)) {
        for (const id of ids) {
          await deleteOrder(id);
        }
      }
    }
  };

  const handleLogout = async () => await logout();

  // FIX: Memoize tabs array to prevent unnecessary re-renders
  const tabs = useMemo(
    () => [
      { id: "add", label: "إضافة قارب", icon: Plus },
      { id: "boats", label: "القوارب", icon: Ship },
      { id: "orders", label: "الطلبات", icon: CalendarCheck },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header - Unchanged */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-bold text-blue">لوحة التحكم</h1>
          </div>
          <div className="text-grey text-sm flex gap-4 items-center">
            مرحباً، المدير
            <button
              className="border border-gray-200 px-2 py-1 rounded-full cursor-pointer"
              onClick={handleLogout}
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      <div className="container py-6">
        {/* Tabs - Desktop */}
        <div className="hidden lg:flex gap-3 mb-8 border-b border-gray-200 pb-3">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSidebarOpen(false);
              }}
              icon={tab.icon}
              label={tab.label}
            />
          ))}
        </div>

        {/* Mobile Sidebar - Unchanged */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            ></div>
            <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-xl p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-blue">القائمة</h2>
                <button onClick={() => setSidebarOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full text-right ${
                      activeTab === tab.id
                        ? "bg-blue text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <tab.icon size={20} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="mt-4">
          {/* Add Boat Tab */}
          {activeTab === "add" && (
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-blue">
                  إضافة قارب جديد
                </h2>
                <p className="text-grey">
                  أدخل بيانات القارب بالكامل، الصورة مطلوبة وبحد أقصى 5MB
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <BoatForm
                  boat={null}
                  onSubmit={handleAddBoat}
                  onCancel={() => setActiveTab("boats")}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          )}

          {/* Boats Management Tab */}
          {activeTab === "boats" && (
            <div>
              <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                <h2 className="text-2xl font-bold text-blue">جميع القوارب</h2>
                <button
                  onClick={() => setActiveTab("add")}
                  className="flex items-center gap-2 bg-blue text-white px-4 py-2 rounded-xl hover:bg-blue/90"
                >
                  <Plus size={18} /> قارب جديد
                </button>
              </div>

              {/* FIX: Show loading state while fetching */}
              {boatsLoading && boats.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl">
                  جاري تحميل القوارب...
                </div>
              ) : boats.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl">
                  لا توجد قوارب مسجلة
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {boats.map((boat) => (
                    <BoatCard
                      key={boat._id} // FIX: Use _id from MongoDB
                      boat={boat}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteBoat}
                      isDeleting={boatsLoading}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders Tab - Updated */}
          {activeTab === "orders" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-blue">إدارة الطلبات</h2>
                <p className="text-grey">عرض وتحديث حالة طلبات حجز اليخوت</p>
              </div>
              <OrdersTable
                orders={orders}
                loading={ordersLoading}
                onUpdateStatus={handleUpdateOrderStatus}
                onDeleteOrder={handleDeleteOrder}
                onDeleteAllOrders={handleDeleteAllOrders}
              />
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && selectedBoat && (
        <EditBoatModal
          boat={selectedBoat}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedBoat(null);
          }}
          onSave={handleUpdateBoat}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default Dashboard;
