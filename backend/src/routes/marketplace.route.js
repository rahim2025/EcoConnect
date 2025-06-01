import express from "express";
import {
  createMarketplaceItem,
  getMarketplaceItems,
  getMarketplaceItem,
  getUserMarketplaceItems,
  updateMarketplaceItem,
  deleteMarketplaceItem,
  toggleFavorite,
  getFavoriteItems,
  makeOffer,
  respondToOffer,
  markAsSold,
  getCategories,
  getMarketplaceStats
} from "../controllers/marketplace.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes are protected - require authentication
router.use(protectRoute);

// Marketplace item CRUD
router.post("/items", createMarketplaceItem);
router.get("/items", getMarketplaceItems);
router.get("/items/:id", getMarketplaceItem);
router.put("/items/:id", updateMarketplaceItem);
router.delete("/items/:id", deleteMarketplaceItem);

// User's marketplace items
router.get("/my-items", getUserMarketplaceItems);
router.get("/user/:userId/items", getUserMarketplaceItems);

// Favorites
router.post("/items/:id/favorite", toggleFavorite);
router.get("/favorites", getFavoriteItems);

// Offers
router.post("/items/:id/offers", makeOffer);
router.patch("/items/:itemId/offers/:offerId", respondToOffer);

// Item status
router.patch("/items/:id/mark-sold", markAsSold);

// Utility routes
router.get("/categories", getCategories);
router.get("/stats", getMarketplaceStats);

export default router;
