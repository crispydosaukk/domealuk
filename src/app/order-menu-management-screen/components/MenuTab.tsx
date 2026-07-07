'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Flame,
  Leaf,
  Loader2,
  ImagePlus,
  Images,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export interface SubMenuItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  isIncluded: boolean;
}

interface SubItemState {
  id: string;
  name: string;
  price: number;
  isIncluded: boolean;
  image?: string;
  file?: File;
  preview?: string;
}

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  desc: string;
  spice: number;
  active: boolean;
  tag: string | null;
  images?: string[];
  nutritionalInfo?: string | null;
  ingredients?: string | null;
  allergens?: string | null;
  heatingInstructions?: string | null;
  dietaryTags?: {
    isVegan: boolean;
    isVegetarian: boolean;
    isGlutenFree: boolean;
    isDairyFree: boolean;
    isNutFree: boolean;
  };
  originalPrice?: number | null;
  portionPrice?: string | null;
  offerText?: string | null;
  subItems?: SubMenuItem[];
}

const categoryOptions = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Sweets', 'Combo Packs'];

type MenuItemForm = {
  name: string;
  category: string;
  price: number;
  desc: string;
  spice: number;
  tag: string;
  active: boolean;
  nutritionalInfo: string;
  ingredients: string;
  allergens: string;
  heatingInstructions: string;
  isVegan: boolean;
  isVegetarian: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
  isNutFree: boolean;
  originalPrice: number;
  portionPrice: string;
  offerText: string;
};

const SpiceSelector = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex gap-1 flex-wrap">
    {[0, 1, 2, 3].map((level) => (
      <button
        key={level}
        type="button"
        onClick={() => onChange(level)}
        className={`px-3 py-1.5 rounded-lg text-xs font-600 border transition-all ${value === level ? 'bg-orange-100 border-primary text-primary' : 'bg-white border-border text-muted-foreground'}`}
      >
        {level === 0 ? 'Mild' : level === 1 ? '🌶 Low' : level === 2 ? '🌶🌶 Med' : '🌶🌶🌶 Hot'}
      </button>
    ))}
  </div>
);

export default function MenuTab() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [spiceValue, setSpiceValue] = useState(0);

  // Image state
  const [existingImages, setExistingImages] = useState<string[]>([]); // URLs already saved
  const [newFiles, setNewFiles] = useState<File[]>([]); // new files to upload
  const [newPreviews, setNewPreviews] = useState<string[]>([]); // object URLs for preview
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sub-items state
  const [subItems, setSubItems] = useState<SubItemState[]>([]);

  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<MenuItemForm>();

  useEffect(() => {
    if (!user || user.email !== 'domealuk79812@gmail.com') return;

    const q = query(collection(db, 'menuItems'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MenuItem));
      setLoading(false);
    });
  }, [user]);

  const filtered = items.filter((i) => {
    return (
      i.name.toLowerCase().includes(search.toLowerCase()) &&
      (categoryFilter === 'All' || i.category === categoryFilter)
    );
  });

  const resetImageState = () => {
    newPreviews.forEach((url) => URL.revokeObjectURL(url));
    setExistingImages([]);
    setNewFiles([]);
    setNewPreviews([]);
    subItems.forEach((s) => {
      if (s.preview) URL.revokeObjectURL(s.preview);
    });
    setSubItems([]);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setSpiceValue(0);
    resetImageState();
    reset({
      name: '',
      category: 'Breakfast',
      price: 0,
      desc: '',
      tag: '',
      active: true,
      spice: 0,
      nutritionalInfo: '',
      ingredients: '',
      allergens: '',
      heatingInstructions: '',
      isVegan: false,
      isVegetarian: false,
      isGlutenFree: false,
      isDairyFree: false,
      isNutFree: false,
      originalPrice: 0,
      portionPrice: '',
      offerText: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setSpiceValue(item.spice);
    setExistingImages(item.images || []);
    setNewFiles([]);
    setNewPreviews([]);
    setSubItems(item.subItems?.map((s) => ({ ...s, id: Math.random().toString() })) || []);
    reset({
      name: item.name,
      category: item.category,
      price: item.price,
      desc: item.desc,
      tag: item.tag ?? '',
      active: item.active,
      spice: item.spice,
      nutritionalInfo: item.nutritionalInfo ?? '',
      ingredients: item.ingredients ?? '',
      allergens: item.allergens ?? '',
      heatingInstructions: item.heatingInstructions ?? '',
      isVegan: item.dietaryTags?.isVegan ?? false,
      isVegetarian: item.dietaryTags?.isVegetarian ?? false,
      isGlutenFree: item.dietaryTags?.isGlutenFree ?? false,
      isDairyFree: item.dietaryTags?.isDairyFree ?? false,
      isNutFree: item.dietaryTags?.isNutFree ?? false,
      originalPrice: item.originalPrice ?? 0,
      portionPrice: item.portionPrice ?? '',
      offerText: item.offerText ?? '',
    });
    setModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const total = existingImages.length + newFiles.length + files.length;
    if (total > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    const previews = files.map((f) => URL.createObjectURL(f));
    setNewFiles((prev) => [...prev, ...files]);
    setNewPreviews((prev) => [...prev, ...previews]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeExisting = (idx: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeNew = (idx: number) => {
    URL.revokeObjectURL(newPreviews[idx]);
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const addSubItem = () => {
    setSubItems((prev) => [
      ...prev,
      { id: Date.now().toString() + Math.random(), name: '', price: 0, isIncluded: true },
    ]);
  };

  const removeSubItem = (id: string) => {
    setSubItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  const updateSubItem = (id: string, field: keyof SubItemState, value: any) => {
    setSubItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const handleSubItemImage = (id: string, file: File) => {
    setSubItems((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          if (i.preview) URL.revokeObjectURL(i.preview);
          return { ...i, file, preview: URL.createObjectURL(file) };
        }
        return i;
      })
    );
  };

  const uploadImages = async (itemId: string): Promise<string[]> => {
    const uploaded: string[] = [];
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const storageRef = ref(storage, `menuImages/${itemId}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      uploaded.push(url);
    }
    return uploaded;
  };

  const uploadSubItemsImages = async (itemId: string): Promise<SubMenuItem[]> => {
    const processed: SubMenuItem[] = [];
    for (const sub of subItems) {
      let imgUrl = sub.image;
      if (sub.file) {
        const storageRef = ref(
          storage,
          `menuImages/${itemId}/subItems/${Date.now()}_${sub.file.name}`
        );
        await uploadBytes(storageRef, sub.file);
        imgUrl = await getDownloadURL(storageRef);
      }
      processed.push({
        id: Math.random().toString(),
        name: sub.name,
        price: Number(sub.price) || 0,
        isIncluded: sub.isIncluded,
        ...(imgUrl ? { image: imgUrl } : {}),
      });
    }
    return processed;
  };

  const onSubmit = async (data: MenuItemForm) => {
    setSaving(true);
    try {
      const payload: any = {
        name: data.name,
        category: data.category,
        price: Number(data.price),
        desc: data.desc,
        spice: spiceValue,
        tag: data.tag || null,
        active: data.active,
        nutritionalInfo: data.nutritionalInfo || null,
        ingredients: data.ingredients || null,
        allergens: data.allergens || null,
        heatingInstructions: data.heatingInstructions || null,
        dietaryTags: {
          isVegan: data.isVegan,
          isVegetarian: data.isVegetarian,
          isGlutenFree: data.isGlutenFree,
          isDairyFree: data.isDairyFree,
          isNutFree: data.isNutFree,
        },
        originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
        portionPrice: data.portionPrice || null,
        offerText: data.offerText || null,
      };

      if (editingItem) {
        // Upload new images first, then combine with kept existing ones
        const newUrls = await uploadImages(editingItem.id);
        payload.images = [...existingImages, ...newUrls];
        payload.subItems = await uploadSubItemsImages(editingItem.id);
        payload.updatedAt = serverTimestamp();
        await updateDoc(doc(db, 'menuItems', editingItem.id), payload);
        toast.success(`"${data.name}" updated`);
      } else {
        // Create doc first to get ID, then upload images
        payload.images = [];
        payload.subItems = [];
        payload.createdAt = serverTimestamp();
        const docRef = await addDoc(collection(db, 'menuItems'), payload);
        const newUrls = await uploadImages(docRef.id);
        const finalSubItems = await uploadSubItemsImages(docRef.id);
        await updateDoc(doc(db, 'menuItems', docRef.id), {
          images: newUrls,
          subItems: finalSubItems,
        });
        toast.success(`"${data.name}" added to menu`);
      }
      setModalOpen(false);
      resetImageState();
      reset();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item: MenuItem) => {
    try {
      await updateDoc(doc(db, 'menuItems', item.id), {
        active: !item.active,
        updatedAt: serverTimestamp(),
      });
      toast.success(`"${item.name}" ${item.active ? 'deactivated' : 'activated'}`);
    } catch {
      toast.error('Failed to update.');
    }
  };

  const confirmDelete = async (id: string) => {
    const item = items.find((i) => i.id === id);
    try {
      await deleteDoc(doc(db, 'menuItems', id));
      setDeleteConfirm(null);
      toast.success(`"${item?.name}" removed`);
    } catch {
      toast.error('Failed to delete.');
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 size={24} className="animate-spin mr-2" /> Loading menu...
      </div>
    );

  const allImages = [...existingImages, ...newPreviews];
  const canAddMore = allImages.length < 5;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search menu items..."
              className="pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 w-56"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 border border-border rounded-xl text-sm bg-white font-600 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-primary text-white font-700 px-4 py-2.5 rounded-xl hover:bg-orange-700 transition-all active:scale-95"
        >
          <Plus size={16} /> Add Menu Item
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>
          <strong className="text-foreground">{items.length}</strong> total
        </span>
        <span>
          <strong className="text-secondary">{items.filter((i) => i.active).length}</strong> active
        </span>
        <span>
          <strong className="text-red-500">{items.filter((i) => !i.active).length}</strong> inactive
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-3 py-16 text-center">
            <p className="font-700 text-foreground mb-1">
              {items.length === 0 ? 'No menu items yet' : 'No items match your filter'}
            </p>
            <button
              onClick={openAddModal}
              className="mt-3 bg-primary text-white font-700 px-5 py-2.5 rounded-xl hover:bg-orange-700"
            >
              Add First Item
            </button>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border-2 transition-all hover:shadow-md overflow-hidden ${item.active ? 'border-border hover:border-orange-200' : 'border-dashed border-gray-300 opacity-60'}`}
            >
              {/* Image strip */}
              {item.images && item.images.length > 0 ? (
                <div className="flex gap-1 p-2 bg-muted/30">
                  {item.images.slice(0, 4).map((url, idx) => (
                    <div key={idx} className="relative h-16 flex-1 rounded-lg overflow-hidden">
                      <Image src={url} alt={item.name} fill className="object-cover" />
                    </div>
                  ))}
                  {item.images.length > 4 && (
                    <div className="h-16 w-10 rounded-lg bg-muted flex items-center justify-center text-xs font-700 text-muted-foreground">
                      +{item.images.length - 4}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-10 bg-muted/20 flex items-center justify-center">
                  <Images size={16} className="text-muted-foreground/40" />
                </div>
              )}

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded border-2 border-secondary flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    </div>
                    <Leaf size={10} className="text-secondary" />
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-600">
                      {item.category}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleActive(item)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${item.active ? 'bg-secondary' : 'bg-gray-300'}`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${item.active ? 'translate-x-5' : 'translate-x-0.5'}`}
                    />
                  </button>
                </div>

                <h3 className="font-700 text-sm text-foreground mb-1">{item.name}</h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{item.desc}</p>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 3 }, (_, i) => (
                      <Flame
                        key={i}
                        size={11}
                        className={
                          i < item.spice
                            ? 'text-red-500 fill-red-400'
                            : 'text-gray-200 fill-gray-200'
                        }
                      />
                    ))}
                  </div>
                  {item.tag && (
                    <span className="text-xs bg-orange-100 text-primary font-700 px-2 py-0.5 rounded-full ml-auto">
                      {item.tag}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xl font-extrabold tabular-nums">
                    £{(item.price || 0).toFixed(2)}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-orange-50 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(item.id)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setModalOpen(false);
              resetImageState();
            }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="font-700 text-lg">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <button
                onClick={() => {
                  setModalOpen(false);
                  resetImageState();
                }}
                className="p-1.5 rounded-lg hover:bg-muted"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              {/* Images */}
              <div>
                <label className="block text-sm font-600 text-foreground mb-2">
                  Photos{' '}
                  <span className="text-xs font-400 text-muted-foreground">
                    ({allImages.length}/5 — shown on website)
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {/* Existing saved images */}
                  {existingImages.map((url, idx) => (
                    <div
                      key={`ex-${idx}`}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-border group"
                    >
                      <Image src={url} alt="menu" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExisting(idx)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X size={16} className="text-white" />
                      </button>
                    </div>
                  ))}
                  {/* New preview images */}
                  {newPreviews.map((url, idx) => (
                    <div
                      key={`new-${idx}`}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-primary group"
                    >
                      <img src={url} alt="preview" className="w-full h-full object-cover" />
                      <div className="absolute top-1 right-1 bg-primary text-white text-[9px] font-700 px-1 rounded">
                        NEW
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNew(idx)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X size={16} className="text-white" />
                      </button>
                    </div>
                  ))}
                  {/* Add button */}
                  {canAddMore && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-orange-50 flex flex-col items-center justify-center gap-1 transition-all text-muted-foreground hover:text-primary"
                    >
                      <ImagePlus size={20} />
                      <span className="text-[10px] font-600">Add Photo</span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
                {allImages.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Upload up to 5 photos. First photo is the main display image.
                  </p>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-600 mb-1.5">Item Name</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  placeholder="e.g. Ven Pongal Set"
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              {/* Category, Original Price, Current Price */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-600 mb-1.5">Category</label>
                  <select
                    {...register('category')}
                    className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Sweets', 'Combo Packs'].map(
                      (c) => (
                        <option key={c}>{c}</option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-600 mb-1.5">Original Price (£)</label>
                  <input
                    {...register('originalPrice', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="e.g. 30.00"
                    className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-600 mb-1.5">Discount Price (£)</label>
                  <input
                    {...register('price', {
                      required: 'Required',
                      min: { value: 0.01, message: 'Must be > 0' },
                      valueAsNumber: true,
                    })}
                    type="number"
                    step="0.01"
                    placeholder="e.g. 22.50"
                    className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-600 mb-1.5">Portion Subtitle</label>
                  <input
                    {...register('portionPrice')}
                    placeholder="e.g. £11.25 + PER PORTION"
                    className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-600 mb-1.5">Offer Text</label>
                  <input
                    {...register('offerText')}
                    placeholder="e.g. Offer valid for 4 deliveries only"
                    className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              {/* Description (Mapped to Ingredients visually) */}
              <div>
                <label className="block text-sm font-600 mb-1.5">Ingredients</label>
                <textarea
                  {...register('desc', { required: 'Required' })}
                  rows={2}
                  placeholder="Describe the dish..."
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
                {errors.desc && <p className="text-red-500 text-xs mt-1">{errors.desc.message}</p>}
              </div>

              {/* Nutritional Information */}
              <div>
                <label className="block text-sm font-600 mb-1.5">
                  Nutritional Information{' '}
                  <span className="font-400 text-xs text-muted-foreground">
                    (One item per line for table format)
                  </span>
                </label>
                <textarea
                  {...register('nutritionalInfo')}
                  rows={5}
                  placeholder="Energy 795 kcal&#10;Fat 60g&#10;of which saturates 9.6g&#10;Carbohydrates 52g&#10;of which sugars 12g"
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              {/* Ingredients (Mapped to Description visually) */}
              <div>
                <label className="block text-sm font-600 mb-1.5">
                  Description{' '}
                  <span className="font-400 text-xs text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  {...register('ingredients')}
                  rows={2}
                  placeholder="e.g. Rice, Lentils, Spices..."
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              {/* Allergens */}
              <div>
                <label className="block text-sm font-600 mb-1.5">
                  Allergens{' '}
                  <span className="font-400 text-xs text-muted-foreground">(optional)</span>
                </label>
                <input
                  {...register('allergens')}
                  placeholder="e.g. Contains Nuts, Dairy"
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Heating Instructions */}
              <div>
                <label className="block text-sm font-600 mb-1.5">
                  Heating Instructions{' '}
                  <span className="font-400 text-xs text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  {...register('heatingInstructions')}
                  rows={2}
                  placeholder="e.g. Microwave for 2 minutes..."
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              {/* Spice */}
              <div>
                <label className="block text-sm font-600 mb-1.5">Spice Level</label>
                <SpiceSelector
                  value={spiceValue}
                  onChange={(v) => {
                    setSpiceValue(v);
                    setValue('spice', v);
                  }}
                />
              </div>

              {/* Dietary Tags */}
              <div>
                <label className="block text-sm font-600 mb-1.5">Dietary Tags</label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="checkbox" {...register('isVegan')} className="accent-primary" />{' '}
                    Vegan (V)
                  </label>
                  <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('isVegetarian')}
                      className="accent-primary"
                    />{' '}
                    Vegetarian (VG)
                  </label>
                  <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('isGlutenFree')}
                      className="accent-primary"
                    />{' '}
                    Gluten-Free (GF)
                  </label>
                  <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('isDairyFree')}
                      className="accent-primary"
                    />{' '}
                    Dairy-Free (DF)
                  </label>
                  <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="checkbox" {...register('isNutFree')} className="accent-primary" />{' '}
                    Nut-Free (NF)
                  </label>
                </div>
              </div>

              {/* Tag */}
              <div>
                <label className="block text-sm font-600 mb-1.5">
                  Badge / Tag{' '}
                  <span className="font-400 text-xs text-muted-foreground">(optional)</span>
                </label>
                <input
                  {...register('tag')}
                  placeholder="Bestseller"
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Active */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  {...register('active')}
                  type="checkbox"
                  className="w-4 h-4 accent-primary"
                  defaultChecked
                />
                <span className="text-sm font-600">Active (visible to customers)</span>
              </label>

              {/* Sub Items */}
              <div className="border-t border-border pt-4 mt-2 mb-2">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-600">Sub-Items / Package Contents</label>
                  <button
                    type="button"
                    onClick={addSubItem}
                    className="text-xs bg-orange-100 text-primary font-700 px-3 py-1.5 rounded-lg hover:bg-orange-200"
                  >
                    + Add Sub-Item
                  </button>
                </div>
                <div className="space-y-3">
                  {subItems.map((sub) => (
                    <div
                      key={sub.id}
                      className="bg-muted p-3 rounded-xl flex gap-3 items-start relative border border-border/50"
                    >
                      <div className="shrink-0 mt-1">
                        <label className="block text-[10px] font-600 mb-1 text-muted-foreground">
                          Photo
                        </label>
                        <div className="relative w-14 h-14 rounded-lg border-2 border-dashed border-border bg-white overflow-hidden flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                          {sub.preview || sub.image ? (
                            <Image
                              src={sub.preview || sub.image!}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <ImagePlus size={16} className="text-muted-foreground" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) =>
                              e.target.files?.[0] && handleSubItemImage(sub.id, e.target.files[0])
                            }
                          />
                        </div>
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-2 pr-4">
                        <div>
                          <label className="block text-[10px] font-600 mb-1 text-muted-foreground">
                            Name
                          </label>
                          <input
                            value={sub.name}
                            onChange={(e) => updateSubItem(sub.id, 'name', e.target.value)}
                            placeholder="Item name"
                            className="w-full px-2 py-1.5 text-xs rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-600 mb-1 text-muted-foreground">
                            Extra Price (£)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={sub.price}
                            onChange={(e) => updateSubItem(sub.id, 'price', e.target.value)}
                            placeholder="0.00"
                            className="w-full px-2 py-1.5 text-xs rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary/50"
                          />
                        </div>
                        <div className="col-span-2 flex items-center gap-2 mt-1">
                          <input
                            type="checkbox"
                            checked={sub.isIncluded}
                            onChange={(e) => updateSubItem(sub.id, 'isIncluded', e.target.checked)}
                            className="accent-primary w-3.5 h-3.5 cursor-pointer"
                          />
                          <span
                            className="text-xs font-600 cursor-pointer"
                            onClick={() => updateSubItem(sub.id, 'isIncluded', !sub.isIncluded)}
                          >
                            Included by default
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSubItem(sub.id)}
                        className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-lg shadow-sm hover:bg-red-50 border border-border transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {subItems.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">
                      No sub-items added. Use this for combo packages or customizable meals.
                    </p>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    resetImageState();
                  }}
                  className="flex-1 border border-border font-600 py-3 rounded-xl hover:bg-muted transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-primary text-white font-700 py-3 rounded-xl hover:bg-orange-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving...
                    </>
                  ) : editingItem ? (
                    'Save Changes'
                  ) : (
                    'Add Item'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="font-700 text-lg mb-2">Delete Menu Item?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              &quot;{items.find((i) => i.id === deleteConfirm)?.name}&quot; will be permanently
              removed from your menu and website.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 border border-border font-600 py-2.5 rounded-xl hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deleteConfirm)}
                className="flex-1 bg-red-500 text-white font-700 py-2.5 rounded-xl hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
