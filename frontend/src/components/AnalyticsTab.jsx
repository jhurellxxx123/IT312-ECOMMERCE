import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { Users, Package, ShoppingCart, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const AnalyticsTab = () => {
  const [analyticsData, setAnalyticsData] = useState({
    users: 0,
    products: 0,
    totalSales: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dailySalesData, setDailySalesData] = useState([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await axios.get("/analytics");
        setAnalyticsData(response.data.analyticsData);

        // 1. Parse the data
        const formattedData = response.data.dailySalesData.map(item => ({
          date: item.date || item._id,
          sales: item.sales,
          revenue: item.revenue
        }));

        // 2. Ensure only the last 7 days are shown
        // .slice(-7) takes the last 7 elements of the array.
        // If the backend returns 30 days, this keeps the most recent 7.
        const last7DaysData = formattedData.slice(-7);

        console.log("Chart Data (Last 7 Days):", last7DaysData); 
        setDailySalesData(last7DaysData);

      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <AnalyticsCard
          title='Total Users'
          value={analyticsData.users.toLocaleString()}
          icon={Users}
          color='from-emerald-500 to-teal-700'
        />
        <AnalyticsCard
          title='Total Products'
          value={analyticsData.products.toLocaleString()}
          icon={Package}
          color='from-emerald-500 to-green-700'
        />
        <AnalyticsCard
          title='Total Sales'
          value={analyticsData.totalSales.toLocaleString()}
          icon={ShoppingCart}
          color='from-emerald-500 to-cyan-700'
        />
        <AnalyticsCard
          title='Total Revenue'
          value={`$${analyticsData.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color='from-emerald-500 to-lime-700'
        />
      </div>

      <motion.div
        className='bg-gray-800/60 rounded-lg p-6 shadow-lg'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <div className="mb-4">
           <h2 className="text-xl font-semibold text-gray-100">Sales Overview</h2>
           <p className="text-gray-400 text-sm">Performance over the past 7 days</p>
        </div>

        <ResponsiveContainer width='100%' height={400}>
          <BarChart data={dailySalesData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis 
                dataKey='date' 
                stroke='#D1D5DB' 
                // Optional: Shorten date format to be readable (e.g. MM/DD)
                tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
            />
            <YAxis yAxisId='left' stroke='#D1D5DB' />
            <YAxis yAxisId='right' orientation='right' stroke='#D1D5DB' />
            <Tooltip 
              contentStyle={{ backgroundColor: "rgba(31, 41, 55, 0.8)", borderColor: "#4B5563" }}
              itemStyle={{ color: "#E5E7EB" }}
              labelFormatter={(label) => new Date(label).toLocaleDateString()} // Clean tooltip date
            />
            <Legend />
            <Bar
              yAxisId='left'
              dataKey='sales'
              fill='#10B981'
              name='Sales'
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId='right'
              dataKey='revenue'
              fill='#3B82F6'
              name='Revenue'
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};
export default AnalyticsTab;

const AnalyticsCard = ({ title, value, icon: Icon, color }) => (
  <motion.div
    className={`bg-gray-800 rounded-lg p-6 shadow-lg overflow-hidden relative ${color}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className='flex justify-between items-center'>
      <div className='z-10'>
        <p className='text-emerald-300 text-sm mb-1 font-semibold'>{title}</p>
        <h3 className='text-white text-3xl font-bold'>{value}</h3>
      </div>
    </div>
    <div className='absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-900 opacity-30' />
    <div className='absolute -bottom-4 -right-4 text-emerald-800 opacity-50'>
      <Icon className='h-32 w-32' />
    </div>
  </motion.div>
);