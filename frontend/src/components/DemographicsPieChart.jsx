import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const DemographicsPieChart = ({ data }) => {
    const colors = ['#2dd4bf', '#34d399', '#60a5fa', '#f472b6', '#fb923c'];

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default DemographicsPieChart;