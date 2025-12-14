import { PlusCircleIcon, ShoppingBasketIcon, BarChart, FileCode } from "lucide-react";
import { motion } from "framer-motion";
import AnalyticsTab from "../components/AnalyticsTab";
import CreateProductForm from "../components/CreateProductForm";
import ProductsList from "../components/ProductsList";
import { useEffect, useState } from "react";
import { useProductStore } from "../stores/useProductStore";

const tabs = [
    { id: "create", label: " CREATE PRODUCT", icon: PlusCircleIcon },
    { id: "products", label: "ALL PRODUCTS", icon: ShoppingBasketIcon },
    { id: "analytics", label: "ANALYTICS", icon: BarChart },
];

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState("create");
    
    // 1. We need 'products' here to export them
    const { fetchAllProducts, products } = useProductStore();

    useEffect(() => {
        fetchAllProducts();
    }, [fetchAllProducts]);

    // 2. The Export Function
    const handleExportXML = () => {
        if (!products || products.length === 0) {
            alert("No products to export!");
            return;
        }

        const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <metadata>
    <exportedAt>${new Date().toISOString()}</exportedAt>
    <count>${products.length}</count>
  </metadata>
  <products>
    ${products.map((product) => `
    <product id="${product._id}">
      <name>${product.name.replace(/&/g, '&amp;')}</name>
      <price currency="USD">${product.price}</price>
      <category>${product.category}</category>
      <stock>${product.quantity || 0}</stock>
      <image>${product.image}</image>
    </product>`).join("")}
  </products>
</catalog>`;

        const blob = new Blob([xmlContent], { type: "application/xml" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `products_export_${new Date().toISOString().split('T')[0]}.xml`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className='min-h-screen bg-gray-900 text-white relative overflow-hidden'>
            <div className='relative z-10 container mx-auto px-4 py-16'>
                <motion.h1
                    className='text-4xl font-bold mb-8 text-emerald-400 text-center'
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    Admin Dashboard
                </motion.h1>

                {/* Tabs Navigation */}
                <div className='flex justify-center mb-8'>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center px-4 py-2 mx-2 rounded-md transition-colors duration-200 ${
                                activeTab === tab.id
                                    ? "bg-emerald-600 text-white"
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                        >
                            <tab.icon className='mr-2 h-5 w-5' />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Render Content Based on Tab */}
                {activeTab === "create" && <CreateProductForm />}
                
                {/* 3. Updated Products Section with Export Button */}
                {activeTab === "products" && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <button
                                onClick={handleExportXML}
                                className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                            >
                                <FileCode className="mr-2 h-5 w-5" />
                                Export XML
                            </button>
                        </div>
                        <ProductsList />
                    </div>
                )}
                
                {activeTab === "analytics" && <AnalyticsTab />}
            </div>
        </div>
    );
};
export default AdminPage;