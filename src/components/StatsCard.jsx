import './StatsCard.css';

const StatsCard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary' }) => {
    return (
        <div className={`stats-card stats-card-${color}`}>
            <div className="stats-card-header">
                <div className="stats-card-info">
                    <span className="stats-label">{title}</span>
                    <h3 className="stats-value">{value}</h3>
                    {trend && (
                        <span className={`stats-trend ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
                            {trend === 'up' ? '↑' : '↓'} {trendValue}
                        </span>
                    )}
                </div>
                <div className={`stats-icon stats-icon-${color}`}>
                    {Icon && <Icon />}
                </div>
            </div>
            <div className={`stats-bar stats-bar-${color}`}>
                <div className="stats-bar-fill" style={{ width: '65%' }}></div>
            </div>
        </div>
    );
};

export default StatsCard;
