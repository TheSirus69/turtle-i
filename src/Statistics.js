import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Statistics = ({ isDarkMode }) => {
  const [topGames, setTopGames] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [totalPlays, setTotalPlays] = useState(0);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    const gamesCollection = collection(db, 'games');
    const topGamesQuery = query(gamesCollection, orderBy('playCount', 'desc'), limit(10));
    const topGamesSnapshot = await getDocs(topGamesQuery);
    const topGamesList = topGamesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTopGames(topGamesList);

    const allGamesSnapshot = await getDocs(gamesCollection);
    const allGames = allGamesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const categories = {};
    let plays = 0;
    allGames.forEach(game => {
      plays += game.playCount;
      game.categories.forEach(category => {
        categories[category] = (categories[category] || 0) + 1;
      });
    });
    setTotalPlays(plays);

    const categoryDataArray = Object.entries(categories).map(([name, value]) => ({ name, value }));
    setCategoryData(categoryDataArray);
  };

  return (
    <div className={`p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
      <h2 className="text-2xl font-bold mb-4">Game Statistics</h2>
      <p className="mb-4">Total Plays: {totalPlays}</p>
      
      <h3 className="text-xl font-bold mb-2">Top 10 Games by Play Count</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={topGames}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="playCount" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      <h3 className="text-xl font-bold my-4">Game Categories Distribution</h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Statistics;