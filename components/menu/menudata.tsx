export type Category =
  | "All"
  | "Veg"
  | "Non Veg"
  | "Starters"
  | "Drinks"

export type MenuItem = {
  id: number
  name: string
  category: Category
  price: number
  time: number
  rating: number
  image: string
  description: string
  isVeg: boolean
  popular?: boolean
}

export const menuItems: MenuItem[] = [
    // Veg

    {
        id: 1,
        name: "Heirloom Avocado Toast",
        category: "Veg",
        price: 279,
        time: 12,
        rating: 4.5,
        image: "/images/menu/avocado-toast.jpg",
        description: "Avocado, herbs and toasted sourdough",
        isVeg: true,
        popular: true,
    }, {
    id: 2,
    name: "Margherita Pizza",
    category: "Veg",
    price: 339,
    time: 18,
    rating: 4.7,
    image: "/images/menu/margherita.jpg",
    description: "Tomato, mozzarella and fresh basil",
    isVeg: true,
  },

  {
    id: 3,
    name: "Truffle Mushroom Pasta",
    category: "Veg",
    price: 389,
    time: 20,
    rating: 4.9,
    image: "/images/menu/pasta.jpg",
    description: "Creamy mushroom pasta with truffle",
    isVeg: true,
  },

  {
    id: 4,
    name: "Paneer Tikka Bowl",
    category: "Veg",
    price: 309,
    time: 22,
    rating: 4.6,
    image: "/images/menu/paneer.jpg",
    description: "Paneer tikka, rice and fresh vegetables",
    isVeg: true,
  },

  // NON VEG
  
  {
    id: 5,
    name: "Charred Double Smash",
    category: "Non Veg",
    price: 359,
    time: 18,
    rating: 4.9,
    image: "/images/menu/burger.jpg",
    description: "Double beef patty with cheddar cheese",
    isVeg: false,
    popular: true,
  },

  {
    id: 6,
    name: "Slow Butter Chicken",
    category: "Non Veg",
    price: 399,
    time: 25,
    rating: 4.7,
    image: "/images/menu/butter-chicken.jpg",
    description: "Creamy tomato butter chicken",
    isVeg: false,
    popular: true,
  },

  {
    id: 7,
    name: "Citrus Glazed Salmon",
    category: "Non Veg",
    price: 449,
    time: 24,
    rating: 4.8,
    image: "/images/menu/salmon.jpg",
    description: "Grilled salmon with citrus glaze",
    isVeg: false,
  },

  {
    id: 8,
    name: "Chicken Tikka Bowl",
    category: "Non Veg",
    price: 349,
    time: 22,
    rating: 4.6,
    image: "/images/menu/chicken-tikka.jpg",
    description: "Grilled chicken, rice and vegetables",
    isVeg: false,
  },

  // STARTERS
  
  {
    id: 9,
    name: "Crispy Chicken Bites",
    category: "Starters",
    price: 239,
    time: 15,
    rating: 4.7,
    image: "/images/menu/chicken-bites.jpg",
    description: "Crispy chicken with house sauce",
    isVeg: false,
  },

  {
    id: 10,
    name: "Paneer Tikka",
    category: "Starters",
    price: 209,
    time: 14,
    rating: 4.6,
    image: "/images/menu/paneer-tikka.jpg",
    description: "Charred paneer with mint chutney",
    isVeg: true,
  },

  {
    id: 11,
    name: "Bruschetta",
    category: "Starters",
    price: 189,
    time: 10,
    rating: 4.5,
    image: "/images/menu/bruschetta.jpg",
    description: "Tomato, basil and toasted bread",
    isVeg: true,
  },

  {
    id: 12,
    name: "Chicken Wings",
    category: "Starters",
    price: 259,
    time: 18,
    rating: 4.8,
    image: "/images/menu/wings.jpg",
    description: "Spicy glazed chicken wings",
    isVeg: false,
  },

  // DRINKS
  
  {
    id: 13,
    name: "Fresh Lime Soda",
    category: "Drinks",
    price: 99,
    time: 5,
    rating: 4.4,
    image: "/images/menu/lime-soda.jpg",
    description: "Fresh lime with sparkling soda",
    isVeg: true,
  },

  {
    id: 14,
    name: "Mango Smoothie",
    category: "Drinks",
    price: 159,
    time: 7,
    rating: 4.7,
    image: "/images/menu/mango-smoothie.jpg",
    description: "Fresh mango blended smoothie",
    isVeg: true,
  },

  {
    id: 15,
    name: "Iced Coffee",
    category: "Drinks",
    price: 139,
    time: 6,
    rating: 4.6,
    image: "/images/menu/iced-coffee.jpg",
    description: "Cold brewed coffee with milk",
    isVeg: true,
  },

  {
    id: 16,
    name: "Strawberry Shake",
    category: "Drinks",
    price: 149,
    time: 7,
    rating: 4.5,
    image: "/images/menu/strawberry-shake.jpg",
    description: "Fresh strawberry milkshake",
    isVeg: true,
  },
]

export const categories: Category[] = [
  "All",
  "Veg",
  "Non Veg",
  "Starters",
  "Drinks",
]