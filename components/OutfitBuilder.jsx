"use client";

import { useState, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";

const ItemTypes = {
  CLOTHING: "clothing",
  CANVAS_ITEM: "canvas_item",
};

const clothingItems = [
  { id: 1, type: "tshirt", name: "T-Shirt", price: 500, height: 120 },
  { id: 2, type: "pants", name: "Pants", price: 800, height: 150 },
  { id: 3, type: "shirt", name: "Jacket", price: 1500, height: 130 },
  { id: 4, type: "dress", name: "Dress", price: 3500, height: 160 },
  { id: 5, type: "cap", name: "Cap", price: 400, height: 80 },
  { id: 6, type: "shoes", name: "Shoes", price: 2000, height: 70 },
];

function DraggableClothingItem({ item }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CLOTHING,
    item: { ...item },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`w-20 h-20 flex items-center justify-center cursor-move ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <ClothingIcon type={item.type} size={60} />
    </div>
  );
}

function CanvasItem({ item, index, moveItem, onRemoveItem }) {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CANVAS_ITEM,
    item: { index, id: item.instanceId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.CANVAS_ITEM,
    hover(draggedItem, monitor) {
      if (!ref.current) {
        return;
      }

      const dragIndex = draggedItem.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveItem(dragIndex, hoverIndex);

      draggedItem.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`relative group cursor-move ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <ClothingIcon type={item.type} size={180} />
      <button
        onClick={() => onRemoveItem(item.instanceId)}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ×
      </button>
    </div>
  );
}

function OutfitCanvas({ onDrop, items, onRemoveItem, onMoveItem }) {
  const canvasRef = useRef(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.CLOTHING,
    drop: (item, monitor) => {
      if (!canvasRef.current) {
        return;
      }

      onDrop(item);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const applyRefs = (el) => {
    drop(el);
    canvasRef.current = el;
  };

  return (
    <div
      ref={applyRefs}
      className={`bg-gray-100 rounded-lg p-4 relative min-h-[300px] w-full ${
        isOver ? "bg-gray-200" : ""
      } transition-colors border-2 border-gray-400`}
    >
      <div className="text-gray-400 font-bold text-3xl text-center mb-2">
        CANVAS AREA
      </div>

      <div className="flex flex-col items-center mt-4">
        {items.map((item, index) => (
          <CanvasItem
            key={item.instanceId}
            item={item}
            index={index}
            moveItem={onMoveItem}
            onRemoveItem={onRemoveItem}
          />
        ))}
      </div>

      {items.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm pointer-events-none">
          Drag clothing items here
        </div>
      )}
    </div>
  );
}

function ClothingIcon({ type, size = 80 }) {
  switch (type) {
    case "tshirt":
      return (
        <Image
          width={size}
          height={size}
          alt="tshirt"
          className=" pb-2"
          src="https://res.cloudinary.com/dszd8jabc/image/upload/v1745349258/casual-t-shirt-_uz5ub3.png"
        />
      );
    case "pants":
      return (
        <Image
          width={size}
          height={size}
          alt="pants"
          className="w-64 pb-2"
          src="https://res.cloudinary.com/dszd8jabc/image/upload/v1745349258/pants_rbzwd0.png"
        />
      );
    case "shirt":
      return (
        <Image
          width={size}
          height={size}
          alt="shirt"
          src="https://res.cloudinary.com/dszd8jabc/image/upload/v1745349258/long-sleeve-shirt_wgarv0.png"
        />
      );
    case "dress":
      return (
        <Image
          width={size}
          height={size}
          alt="dress"
          src="https://res.cloudinary.com/dszd8jabc/image/upload/v1745349258/dress_jxu0c1.png"
        />
      );
    case "cap":
      return (
        <Image
          width={100}
          height={size}
          alt="cap"
          src="https://res.cloudinary.com/dszd8jabc/image/upload/v1745349257/cap_tixdzj.png"
        />
      );
    case "shoes":
      return (
        <Image
          width={100}
          height={size}
          alt="shoes"
          src="https://res.cloudinary.com/dszd8jabc/image/upload/v1745349258/shoe_s5gmlm.png"
        />
      );
    default:
      return null;
  }
}

export default function OutfitBuilder() {
  const [canvasItems, setCanvasItems] = useState([]);

  const [cart, setCart] = useState([]);

  const generateInstanceId = () =>
    `item_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  const handleDrop = (item) => {
    const newItem = {
      ...item,
      instanceId: generateInstanceId(),
    };
    setCanvasItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (instanceId) => {
    setCanvasItems((prev) =>
      prev.filter((item) => item.instanceId !== instanceId)
    );
  };

  const handleMoveItem = (dragIndex, hoverIndex) => {
    setCanvasItems((prevItems) => {
      const newItems = [...prevItems];

      const draggedItem = newItems[dragIndex];

      newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, draggedItem);
      return newItems;
    });
  };

  const handleReset = () => {
    setCanvasItems([]);
  };

  const handleAddToCart = () => {
    if (canvasItems.length === 0) {
      toast(
        "No items selected Please add items to your outfit before adding cart"
      );
      return;
    }

    const outfitItems = {};
    canvasItems.forEach((item) => {
      if (!outfitItems[item.type]) {
        outfitItems[item.type] = { ...item };
      }
    });

    const outfitId = `outfit_${Date.now()}`;
    const outfit = {
      id: outfitId,
      items: Object.values(outfitItems),
      totalPrice: Object.values(outfitItems).reduce(
        (sum, item) => sum + item.price,
        0
      ),
      date: new Date().toISOString(),
    };

    setCart((prev) => [...prev, outfit]);

    toast(
      `Added to cart!  Your outfit with ${outfit.items.length} items has been added to the cart.`
    );
  };

  const handleSaveOutfit = () => {
    if (canvasItems.length === 0) {
      toast(
        "No items selected  Please add items to your outfit before saving."
      );
      return;
    }

    toast("Your outfit has been saved successfully.");
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-5xl font-bold text-center mb-6">Outfit Builder</h1>

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4">
          <div className="bg-gray-100 rounded-lg p-6 flex flex-col items-center gap-6 border-2 border-gray-400">
            {clothingItems.map((item) => (
              <DraggableClothingItem key={item.id} item={item} />
            ))}
          </div>

          <OutfitCanvas
            onDrop={handleDrop}
            items={canvasItems}
            onRemoveItem={handleRemoveItem}
            onMoveItem={handleMoveItem}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <button
            onClick={handleReset}
            className="bg-gray-100 hover:bg-gray-200 py-3 px-4 rounded-lg text-lg font-medium transition-colors border-2 border-gray-400"
          >
            Reset
          </button>

          <button
            onClick={handleSaveOutfit}
            className="bg-gray-100 hover:bg-gray-200 py-3 px-4 rounded-lg text-lg font-medium transition-colors border-2 border-gray-400"
          >
            Save Outfit
          </button>

          <button
            onClick={handleAddToCart}
            className="bg-gray-100 hover:bg-gray-200 py-3 px-4 rounded-lg text-lg font-medium flex items-center justify-center gap-2 transition-colors border-2 border-gray-400"
          >
            Add to Cart
          </button>
          <ToastContainer />
        </div>

        {cart.length > 0 && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-bold mb-2">
              Cart ({cart.length} {cart.length === 1 ? "outfit" : "outfits"})
            </h2>
            <p>
              Total: ₹
              {cart
                .reduce((sum, outfit) => sum + outfit.totalPrice, 0)
                .toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </DndProvider>
  );
}
