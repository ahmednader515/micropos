/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/parse-data-uri";
exports.ids = ["vendor-chunks/parse-data-uri"];
exports.modules = {

/***/ "(ssr)/./node_modules/parse-data-uri/index.js":
/*!**********************************************!*\
  !*** ./node_modules/parse-data-uri/index.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("var toBuffer = __webpack_require__(/*! data-uri-to-buffer */ \"(ssr)/./node_modules/data-uri-to-buffer/index.js\");\nfunction parseDataUri(dataUri) {\n    return {\n        mimeType: normalizeMimeType(parseMimeType(dataUri)),\n        data: toBuffer(dataUri)\n    };\n}\nfunction parseMimeType(uri) {\n    return uri.substring(5, uri.indexOf(\";\"));\n}\nvar prefix = /^(\\w+\\/)+/;\nfunction normalizeMimeType(mime) {\n    mime = mime.toLowerCase();\n    var once = mime.match(prefix);\n    if (!once || !(once = once[1])) {\n        return mime;\n    }\n    return mime.replace(prefix, once);\n}\nmodule.exports = parseDataUri;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvcGFyc2UtZGF0YS11cmkvaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQUEsSUFBSUEsV0FBV0MsbUJBQU9BLENBQUM7QUFFdkIsU0FBU0MsYUFBY0MsT0FBTztJQUU1QixPQUFPO1FBQ0xDLFVBQVVDLGtCQUFrQkMsY0FBY0g7UUFDMUNJLE1BQU1QLFNBQVNHO0lBQ2pCO0FBQ0Y7QUFFQSxTQUFTRyxjQUFjRSxHQUFHO0lBQ3hCLE9BQU9BLElBQUlDLFNBQVMsQ0FBQyxHQUFHRCxJQUFJRSxPQUFPLENBQUM7QUFDdEM7QUFFQSxJQUFJQyxTQUFTO0FBQ2IsU0FBU04sa0JBQWtCTyxJQUFJO0lBQzdCQSxPQUFPQSxLQUFLQyxXQUFXO0lBQ3ZCLElBQUlDLE9BQU9GLEtBQUtHLEtBQUssQ0FBQ0o7SUFDdEIsSUFBSSxDQUFDRyxRQUFRLENBQUVBLENBQUFBLE9BQU9BLElBQUksQ0FBQyxFQUFFLEdBQUc7UUFDOUIsT0FBT0Y7SUFDVDtJQUNBLE9BQU9BLEtBQUtJLE9BQU8sQ0FBQ0wsUUFBUUc7QUFFOUI7QUFFQUcsT0FBT0MsT0FBTyxHQUFHaEIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9taWNyb3Bvcy8uL25vZGVfbW9kdWxlcy9wYXJzZS1kYXRhLXVyaS9pbmRleC5qcz9jZThjIl0sInNvdXJjZXNDb250ZW50IjpbInZhciB0b0J1ZmZlciA9IHJlcXVpcmUoJ2RhdGEtdXJpLXRvLWJ1ZmZlcicpXG5cbmZ1bmN0aW9uIHBhcnNlRGF0YVVyaSAoZGF0YVVyaSkge1xuXG4gIHJldHVybiB7XG4gICAgbWltZVR5cGU6IG5vcm1hbGl6ZU1pbWVUeXBlKHBhcnNlTWltZVR5cGUoZGF0YVVyaSkpLFxuICAgIGRhdGE6IHRvQnVmZmVyKGRhdGFVcmkpXG4gIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VNaW1lVHlwZSh1cmkpIHtcbiAgcmV0dXJuIHVyaS5zdWJzdHJpbmcoNSwgdXJpLmluZGV4T2YoJzsnKSlcbn1cblxudmFyIHByZWZpeCA9IC9eKFxcdytcXC8pKy9cbmZ1bmN0aW9uIG5vcm1hbGl6ZU1pbWVUeXBlKG1pbWUpIHtcbiAgbWltZSA9IG1pbWUudG9Mb3dlckNhc2UoKVxuICB2YXIgb25jZSA9IG1pbWUubWF0Y2gocHJlZml4KVxuICBpZiAoIW9uY2UgfHwgIShvbmNlID0gb25jZVsxXSkpIHtcbiAgICByZXR1cm4gbWltZVxuICB9XG4gIHJldHVybiBtaW1lLnJlcGxhY2UocHJlZml4LCBvbmNlKVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2VEYXRhVXJpIl0sIm5hbWVzIjpbInRvQnVmZmVyIiwicmVxdWlyZSIsInBhcnNlRGF0YVVyaSIsImRhdGFVcmkiLCJtaW1lVHlwZSIsIm5vcm1hbGl6ZU1pbWVUeXBlIiwicGFyc2VNaW1lVHlwZSIsImRhdGEiLCJ1cmkiLCJzdWJzdHJpbmciLCJpbmRleE9mIiwicHJlZml4IiwibWltZSIsInRvTG93ZXJDYXNlIiwib25jZSIsIm1hdGNoIiwicmVwbGFjZSIsIm1vZHVsZSIsImV4cG9ydHMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/parse-data-uri/index.js\n");

/***/ })

};
;