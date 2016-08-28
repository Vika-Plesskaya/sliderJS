var a = 10;
(function (b) {
    b = 20;
}(a));
console.log(a);

var a1 = {
    a: 10
};
(function (b) {
    b.a = 20;
}(a1));
console.log(a1);

if ("a" in window) {
    var a = 25;
}
console.log(a);