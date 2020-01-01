// LCD display utils

// Convert arrival info to display lines for the LCD screen
const arrivalInfoToDisplayLines = arrivalInfo => {
    const routeIds = Object.keys(arrivalInfo);
    return routeIds.map(routeId => {
        const displaySections = [];
        const routeInfo = arrivalInfo[routeId];

        // Route name + colon, end-padded to 4 chars with a space, e.g.,
        //  '11:  '
        //  '150: '
        displaySections.push((routeInfo.routeName + ':').padEnd(4, ' '));

        // For each arrival time, usually 2 or 3, push a start-padded "minutes-
        // 'till" section to 3 chars, e.g.,
        //  '120'
        //  ' 35'
        //  '  1'
        //  ' -3'
        routeInfo.upcomingArrivalTimes.forEach(upcomingArrival => {
            displaySections.push(
                upcomingArrival.minsUntilArrival.toString().padStart(3, ' '),
            );
        });

        // Join all sections together w/ a space, e.g.,
        //  '11:   -3  15    '
        //  '12:    1  25  35'
        return displaySections.join(' ');
    });
};

module.exports = {
    arrivalInfoToDisplayLines,
};
