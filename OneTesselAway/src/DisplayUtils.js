// LCD display utils

// TODO: Add status symbols, e.g., "time to leave"
const arrivalInfoToDisplayLines = arrivalInfo => {
    const routeIds = Object.keys(arrivalInfo);
    return routeIds.map(routeId => {
        const displaySections = [];
        const routeInfo = arrivalInfo[routeId];
        displaySections.push(routeInfo.routeName + ':');
        routeInfo.upcomingArrivalTimes.forEach(upcomingArrival => {
            displaySections.push(
                upcomingArrival.minsUntilArrival.toString().padStart(3, ' '),
            );
        });
        return displaySections.join(' ');
    });
};

module.exports = {
    arrivalInfoToDisplayLines,
};
