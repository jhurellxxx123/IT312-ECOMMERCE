import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			// LOGIC: Password is required ONLY if googleId is NOT present
			required: function() { return !this.googleId; }, 
			minlength: [8, "Password must be at least 8 characters long"],
		},
		cartItems: [
			{
				quantity: {
					type: Number,
					default: 1,
				},
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
				},
			},
		],
		role: {
			type: String,
			enum: ["customer", "admin"],
			default: "customer",
		},
		image: {
			type: String,
			default: "",
		},
		googleId: {
			type: String,
			unique: true,
			sparse: true, 
		},
		isVerified: {
			type: Boolean,
			default: false,
		}
	},
	{
		timestamps: true,
	}
);

// --- FIXED PRE-SAVE HOOK ---
// Note: We removed 'next' from the arguments.
userSchema.pre("save", async function () {
	// 1. If password is NOT modified (or doesn't exist), just return.
	if (!this.isModified("password")) return;

	try {
		// 2. Hash the password
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
	} catch (error) {
		// If hashing fails, we throw the error so Mongoose catches it
		throw error; 
	}
});

userSchema.methods.comparePassword = async function (candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;