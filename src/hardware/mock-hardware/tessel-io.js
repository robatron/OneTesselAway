// Mock hardware for the `tessel-io` johnny-five board. Note we must
// use `function` instead of a fat-arrow function so it can be
// initialized as a constructor with `new`

module.exports = () =>
    function() {
        return 'mock-tessel-io';
    };
