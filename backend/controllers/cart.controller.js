import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
    try {
        // FIX: Extract the product IDs from the cartItems array
        const productIds = req.user.cartItems.map((item) => item.product);

        // Pass the list of IDs, not the list of objects
        const products = await Product.find({ _id: { $in: productIds } });

        const cartItems = products.map((product) => {
            const item = req.user.cartItems.find((cartItem) => cartItem.product.toString() === product.id);
            return { ...product.toJSON(), quantity: item.quantity };
        });

        res.json(cartItems);
    } catch (error) {
        console.log("Error in getCartProducts controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const addToCart = async (req, res) => {
   
    try {
        const { productId } = req.body;
        const user = req.user;

        // Safety check: ensure user exists (in case auth middleware failed silently)
        if (!user) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const existingItem = user.cartItems.find((item) => item.product.toString() === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            user.cartItems.push({ product: productId, quantity: 1 });
        }

        await user.save();
        res.json(user.cartItems);

    } catch (error) {
        console.log("Error in addToCart controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const removeAllFromCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user;

        if (!productId) {
            user.cartItems = [];
        } else {
            // FIX: Filter by checking 'item.product'
            user.cartItems = user.cartItems.filter((item) => item.product.toString() !== productId);
        }

        await user.save();
        res.json(user.cartItems);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateQuantity = async (req, res) => {
    try {
        const { id: productId } = req.params;
        const { quantity } = req.body;
        const user = req.user;

        // FIX: Find by checking 'item.product'
        const existingItem = user.cartItems.find((item) => item.product.toString() === productId);

        if (existingItem) {
            if (quantity === 0) {
                // FIX: Filter by checking 'item.product'
                user.cartItems = user.cartItems.filter((item) => item.product.toString() !== productId);
                await user.save();
                return res.json(user.cartItems);
            }

            existingItem.quantity = quantity;
            await user.save();
            res.json(user.cartItems);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        console.log("Error in updateQuantity controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};