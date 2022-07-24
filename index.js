'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var googleMaps = require('@deck.gl/google-maps');
var layers = require('@deck.gl/layers');
var geoLayers = require('@deck.gl/geo-layers');
var aggregationLayers = require('@deck.gl/aggregation-layers');
var core = require('@deck.gl/core');
var Supercluster = require('supercluster');
var html2canvas = require('html2canvas');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var Supercluster__default = /*#__PURE__*/_interopDefaultLegacy(Supercluster);
var html2canvas__default = /*#__PURE__*/_interopDefaultLegacy(html2canvas);

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var defaultStyles = [];

var noop = function noop() {};

var GoogleMaps = function GoogleMaps(parent) {
  var _this = this;

  _classCallCheck(this, GoogleMaps);

  _defineProperty(this, "triggerCustomEventForCenterChange", function () {
    var eventId = _this.isSecondScreen ? 'c2_changed' : 'c1_changed';
    window.google.maps.event.trigger(_this.map, eventId);
  });

  _defineProperty(this, "initMap", function () {
    _this.htmlContainer = _this.parent.htmlContainer;

    _this.renderMap();
  });

  _defineProperty(this, "getMapInstance", function () {
    return _this.map;
  });

  _defineProperty(this, "renderMap", function () {
    var hasError = _this.loadMap();

    if (hasError) {
      return false;
    }

    return true;
  });

  _defineProperty(this, "loadMap", function () {
    var center = _this.currCenter;

    if (!_this.currCenter) {
      center = new window.google.maps.LatLng(_this.centerPoint.Lat, _this.centerPoint.Lon);
      _this.currCenter = center;
    }

    var mapTypeId;
    var mapTypeStyles;

    if (_this.mapTypeConfig) {
      mapTypeId = _this.mapTypeConfig.id;
      mapTypeStyles = new window.google.maps.StyledMapType(_this.mapTypeConfig.styles);
    }

    var mapProp = {
      mapId: '20c1d70cd3b2186c',
      center: center,
      minZoom: _this.minZoom,
      zoom: _this.zoom,
      mapTypeId: mapTypeId || window.google.maps.MapTypeId.ROADMAP,
      streetViewControl: _this.streetViewControl,
      draggableCursor: _this.draggableCursor,
      disableDefaultUI: _this.disableDefaultUI,
      zoomControl: _this.zoomControl,
      mapTypeControl: _this.mapTypeControl,
      mapTypeControlOptions: _this.mapTypeControlOptions,
      styles: _this.mapStyles,
      zoomControlOptions: {
        style: window.google.maps.ZoomControlStyle.SMALL,
        position: window.google.maps.ControlPosition.RIGHT_BOTTOM
      },
      clickableIcons: _this.clickableIcons,
      tilt: _this.tilt
    };
    var hasError = false;
    if (!window['gzoom']) window['gzoom'] = mapProp.zoom;

    try {
      _this.map = new window.google.maps.Map(_this.htmlContainer, mapProp);

      if (_this.mapTypeConfig) {
        _this.map.mapTypes.set(mapTypeId, mapTypeStyles);
      }

      _this.initIconLayer();
    } catch (er) {
      hasError = true;
    }

    if (hasError) {
      return hasError;
    }

    return hasError;
  });

  _defineProperty(this, "setAutoCompleteCallback", function (autoCompleteCallback) {
    _this.autoCompleteCallback = autoCompleteCallback;
  });

  _defineProperty(this, "setHandleMapMouseClick", function (handleMapMouseClick) {
    _this.handleMapMouseClick = handleMapMouseClick;
  });

  _defineProperty(this, "setTilt", function (tilt) {
    if (_this.map) {
      _this.map.setTilt(tilt);
    }
  });

  _defineProperty(this, "setMapStyles", function (mapStyles) {
    _this.mapStyles = mapStyles;
  });

  _defineProperty(this, "changeMapZoom", function (zoomLevel) {
    if (_this.map) {
      _this.map.setZoom(zoomLevel);
    }
  });

  _defineProperty(this, "setPanToMap", function (location) {
    if (_this.map) {
      var loc = location;

      if (typeof location.lat === 'function') {
        loc = {
          lat: parseFloat(location.lat()),
          lng: parseFloat(location.lng())
        };
      }

      _this.triggerCustomEventForCenterChange();

      _this.map.panTo(loc);
    }
  });

  _defineProperty(this, "getCurrentZoom", function () {
    return _this.map.zoom;
  });

  _defineProperty(this, "setPanToLatLng", function (latitude, longitude) {
    if (_this.map) {
      var latLng = new window.google.maps.LatLng(latitude, longitude);

      _this.triggerCustomEventForCenterChange();

      _this.map.panTo(latLng);
    }
  });

  _defineProperty(this, "onLocationSearch", function () {
    var place = _this.autoComplete.getPlace();

    _this.autoCompleteCallback(place);
  });

  _defineProperty(this, "loadAutoComplete", function () {
    _this.autoCompleteInputHtml = _this.parent.autoCompleteInputHtml;
    _this.autoComplete = new window.google.maps.places.Autocomplete(_this.autoCompleteInputHtml);
    window.google.maps.event.addListener(_this.autoComplete, 'place_changed', _this.onLocationSearch);
  });

  _defineProperty(this, "findGeoLocation", function (_ref) {
    var searchString = _ref.searchString,
        resolve = _ref.resolve,
        zoomLevel = _ref.zoomLevel,
        reject = _ref.reject,
        clickCallback = _ref.clickCallback,
        _ref$isLatLng = _ref.isLatLng,
        isLatLng = _ref$isLatLng === void 0 ? false : _ref$isLatLng;
    var geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({
      address: searchString
    }, function (results, status) {
      if (status === window.google.maps.GeocoderStatus.OK) {
        var handleClick = function handleClick(e) {
          if (isLatLng) {
            clickCallback(e, results[0].formatted_address, searchString);
          } else {
            clickCallback(e, searchString, searchString);
          }
        };

        resolve({
          zoomLevel: zoomLevel,
          place: results[0],
          clickCallback: handleClick
        });
      } else {
        reject();
      }
    });
  });

  _defineProperty(this, "plotMarker", function (markerConfig) {
    var marker = new window.google.maps.Marker({
      map: _this.map,
      position: markerConfig.location,
      icon: markerConfig.icon
    });

    if (markerConfig.clickCallback) {
      var handleClick = function handleClick(e) {
        markerConfig.clickCallback(e, markerConfig.address);
      };

      marker.addListener('click', handleClick);
    }

    return marker;
  });

  _defineProperty(this, "plotMarkerWithLatLng", function (latitude, longitude) {
    var marker = new window.google.maps.Marker({
      map: _this.map,
      position: new window.google.maps.LatLng(latitude, longitude)
    });
    return marker;
  });

  _defineProperty(this, "getMapBounds", function () {
    var bounds = _this.map.getBounds();

    if (bounds) {
      var northEastCorner = bounds.getNorthEast();
      var southWestCorner = bounds.getSouthWest();
      return {
        hlat: northEastCorner.lat(),
        hlong: northEastCorner.lng(),
        llat: southWestCorner.lat(),
        llong: southWestCorner.lng()
      };
    }
  });

  _defineProperty(this, "addBoundsListner", function () {
    if (_this.map) {
      window.google.maps.event.addListener(_this.map, 'bounds_changed', _this.handleBoundsChange);
    }
  });

  _defineProperty(this, "addCenterListner", function () {
    if (_this.map) {
      window.google.maps.event.addListener(_this.map, 'center_changed', _this.handleCenterChange);
    }
  });

  _defineProperty(this, "handleBoundsChange", function () {
    _this.boundChangeCallback(_this.map.zoom);
  });

  _defineProperty(this, "handleCenterChange", function () {
    _this.centerChangeCallBack(_this.map.center);
  });

  _defineProperty(this, "setZoomLevelChangeCallback", function (boundChangeCallback) {
    _this.boundChangeCallback = boundChangeCallback;
  });

  _defineProperty(this, "setCenterChangeCallBack", function (centerChangeCallBack) {
    _this.centerChangeCallBack = centerChangeCallBack;
  });

  _defineProperty(this, "removeMarker", function (marker) {
    marker.setMap(null);
  });

  _defineProperty(this, "initIconLayer", function () {
    var deckGlProps = {
      glOptions: {
        preserveDrawingBuffer: true
      },
      getTooltip: function getTooltip(object) {
        var _object$layer, _object$layer$props;

        var onHover = object === null || object === void 0 ? void 0 : (_object$layer = object.layer) === null || _object$layer === void 0 ? void 0 : (_object$layer$props = _object$layer.props) === null || _object$layer$props === void 0 ? void 0 : _object$layer$props.onHover;

        if (onHover && typeof onHover === 'function') {
          return onHover(object);
        }
      }
    };
    _this.mapOverlay = new googleMaps.GoogleMapsOverlay(deckGlProps);

    _this.mapOverlay.setMap(_this.map);
  });

  _defineProperty(this, "getDistanceInMeters", function (ele) {
    if (ele.type === 'polygon') {
      return window.google.maps.geometry.spherical.computeArea(ele.shape.getPath());
    } else if (ele.type === 'polyline') {
      return window.google.maps.geometry.spherical.computeLength(ele.shape.getPath());
    }
  });

  this.parent = parent;
  this.currCenter = null;
  this.autoComplete = null;
  this.autoCompleteInputHtml = null;
  this.autoCompleteCallback = noop;
  this.boundChangeCallback = noop;
  this.centerChangeCallBack = noop;
  this.mapScript = null;
  this.centerPoint = parent.centerPoint;
  this.zoomRestriction = parent.zoomRestriction || {};
  this.map = null;
  this.mapOverlay = null;
  this.mapStyles = parent.styles || defaultStyles;
  this.handleMapMouseClick = null;
  this.layerLocationMarker = null;
  this.minZoom = parent.minZoom;
  this.zoom = parent.zoom;
  this.streetViewControl = parent.streetViewControl;
  this.draggableCursor = parent.draggableCursor;
  this.disableDefaultUI = parent.disableDefaultUI;
  this.zoomControl = parent.zoomControl;
  this.mapTypeControl = parent.mapTypeControl;
  this.clickableIcons = parent.clickableIcons;
  this.mapTypeControlOptions = {
    position: window.google.maps.ControlPosition.TOP_CENTER
  };
  this.tilt = parent.tilt;
  this.searchBox = null;
  this.isSecondScreen = parent.isSecondScreen;
  this.mapTypeConfig = parent.mapTypeConfig;
};

var CENTER_POINT = {
  Lat: 28.7041,
  Lon: 77.1025
};

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

var throwError = function throwError(message) {
  if (process.env.NODE_ENV !== 'production') {
    throw new Error(message);
  }
};
var buildQueryFromObject = function buildQueryFromObject(query) {
  var qs = '';

  if (query && _typeof(query) === 'object') {
    Object.keys(query).forEach(function (key) {
      qs += "&".concat(key, "=").concat(query[key]);
    });
  }

  return qs;
};
var getFileNameTimestamp = function getFileNameTimestamp() {
  var date = new Date();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + '.' + minutes + ' ' + ampm;
  return "".concat(date.getFullYear(), "-").concat(date.getMonth() + 1, "-").concat(date.getDate(), " at ").concat(strTime);
};

var MapGL = function MapGL(_ref) {
  var _this = this;

  var _ref$mapConfig = _ref.mapConfig,
      mapConfig = _ref$mapConfig === void 0 ? {} : _ref$mapConfig;

  _classCallCheck(this, MapGL);

  _defineProperty(this, "getMapBounds", function () {
    return _this.map.getMapBounds();
  });

  _defineProperty(this, "getMapBoundsQuery", function () {
    var bounds = _this.map.getMapBounds();

    return buildQueryFromObject(bounds);
  });

  _defineProperty(this, "setHtmlContainer", function (htmlContainer) {
    _this.htmlContainer = htmlContainer;
  });

  _defineProperty(this, "init", function (containerId) {
    var container = document.getElementById(containerId);

    _this.setHtmlContainer(container);

    _this.map.initMap();

    _this.map.addBoundsListner();

    _this.map.addCenterListner();
  });

  _defineProperty(this, "renderMap", function () {
    return _this.map.renderMap();
  });

  _defineProperty(this, "changeMapZoom", function (zoomLevel) {
    _this.map.changeMapZoom(zoomLevel);
  });

  _defineProperty(this, "setMapStyles", function (mapStyles) {
    _this.map.setMapStyles(mapStyles);
  });

  _defineProperty(this, "onLocationSearch", function (place) {
    _this.map.autoCompleteCallback(place);
  });

  _defineProperty(this, "getCurrentZoom", function () {
    return _this.map.getCurrentZoom();
  });

  _defineProperty(this, "setPanToMap", function (location) {
    _this.map.setPanToMap(location);
  });

  _defineProperty(this, "getMapInstance", function () {
    return _this.map.getMapInstance();
  });

  _defineProperty(this, "setPanToLatLng", function (latitude, longitude) {
    _this.map.setPanToLatLng(latitude, longitude);
  });

  _defineProperty(this, "setAutoCompleteInputHtml", function (autoCompleteInputHtml) {
    _this.autoCompleteInputHtml = autoCompleteInputHtml;
  });

  _defineProperty(this, "setAutoCompleteCallback", function (autoCompleteCallback) {
    _this.map.setAutoCompleteCallback(autoCompleteCallback);
  });

  _defineProperty(this, "setHandleMapMouseClick", function (handleMapMouseClick) {
    _this.map.setHandleMapMouseClick(handleMapMouseClick);
  });

  _defineProperty(this, "setTilt", function (tilt) {
    _this.map.setTilt(tilt);
  });

  _defineProperty(this, "plotMarker", function (markerConfig) {
    return _this.map.plotMarker(markerConfig);
  });

  _defineProperty(this, "plotMarkerWithLatLng", function (latitude, longitude) {
    return _this.map.plotMarkerWithLatLng(latitude, longitude);
  });

  _defineProperty(this, "findGeoLocation", function (config) {
    return _this.map.findGeoLocation(config);
  });

  _defineProperty(this, "loadAutoComplete", function (autoCompleteInputHtml, autoCompleteCallback) {
    _this.setAutoCompleteInputHtml(autoCompleteInputHtml);

    _this.setAutoCompleteCallback(autoCompleteCallback);

    return _this.map.loadAutoComplete();
  });

  _defineProperty(this, "setZoomLevelChangeCallback", function (cb) {
    _this.map.setZoomLevelChangeCallback(cb);
  });

  _defineProperty(this, "setCenterChangeCallBack", function (cb) {
    _this.map.setCenterChangeCallBack(cb);
  });

  _defineProperty(this, "removeMarker", function (marker) {
    _this.map.removeMarker(marker);
  });

  _defineProperty(this, "zoomLevelChange", function () {
    _this.map.onZoomLevelChange();
  });

  /* Sometimes we have to render more than one instance of map, each having their own context.
    By default mapConfig.allowMultipleInstance will be false.
  */
  MapGL.instance = this;
  this.autoCompleteInputHtml = null;
  this.htmlContainer = null;
  this.centerPoint = mapConfig.centerPoint || CENTER_POINT;
  this.zoomRestriction = mapConfig.zoomRestriction || {};
  this.minZoom = mapConfig.minZoom || 3;
  this.zoom = mapConfig.zoom || 8;
  this.streetViewControl = mapConfig.streetViewControl;
  this.draggableCursor = mapConfig.draggableCursor;
  this.disableDefaultUI = mapConfig.disableDefaultUI;
  this.zoomControl = mapConfig.zoomControl;
  this.mapTypeControl = mapConfig.mapTypeControl;
  this.clickableIcons = mapConfig.clickableIcons;
  this.tilt = mapConfig.tilt || 0;
  this.styles = mapConfig.styles;
  this.isSecondScreen = mapConfig.isSecondScreen;
  this.mapTypeConfig = mapConfig.mapType;
  this.map = new GoogleMaps(this);
  return this;
};

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

var _LAYERS;

var TYPES = {
  ICON: 'icon',
  HEATMAP: 'heatmap',
  TRIPS: 'trips',
  ARC: 'arc',
  POLYGON: 'polygon',
  GEOJSON: 'geojson',
  LINE: 'line',
  SCATTERPLOT: 'scatterplot',
  CLUSTER: 'cluster',
  TILE: 'tile',
  TEXT: 'text',
  TEXT_ICON: 'text_icon',
  HEXAGON: 'hexagon'
};
var LAYERS = (_LAYERS = {}, _defineProperty(_LAYERS, TYPES.ICON, {
  required: ['iconAtlas', 'iconMapping'],
  defaults: {
    pickable: true,
    sizeScale: 2000,
    sizeUnits: 'meters',
    getPosition: function getPosition(d) {
      return d.coordinates;
    },
    getIcon: function getIcon() {
      return 'marker';
    },
    sizeMinPixels: 16,
    sizeMaxPixels: 256
  }
}), _defineProperty(_LAYERS, TYPES.HEATMAP, {
  required: [],
  defaults: {
    getPosition: function getPosition(d) {
      return d.coordinates;
    },
    getWeight: function getWeight(d) {
      return d.weight;
    },
    aggregation: 'SUM'
  }
}), _defineProperty(_LAYERS, TYPES.ARC, {
  required: [],
  defaults: {
    pickable: true,
    getWidth: 12,
    getSourcePosition: function getSourcePosition(d) {
      return d.from.coordinates;
    },
    getTargetPosition: function getTargetPosition(d) {
      return d.to.coordinates;
    },
    getSourceColor: function getSourceColor(d) {
      return [Math.sqrt(d.inbound), 140, 0];
    },
    getTargetColor: function getTargetColor(d) {
      return [Math.sqrt(d.outbound), 140, 0];
    }
  }
}), _defineProperty(_LAYERS, TYPES.TRIPS, {
  required: [],
  defaults: {
    getPath: function getPath(d) {
      return d.waypoints.map(function (p) {
        return p.coordinates;
      });
    },
    // deduct start timestamp from each data point to avoid overflow
    getTimestamps: function getTimestamps(d) {
      return d.waypoints.map(function (p) {
        return p.timestamp - 1554772579000;
      });
    },
    getColor: [253, 128, 93],
    opacity: 0.8,
    widthMinPixels: 5,
    rounded: true,
    trailLength: 200,
    currentTime: 100
  }
}), _defineProperty(_LAYERS, TYPES.POLYGON, {
  required: [],
  defaults: {
    pickable: true,
    stroked: true,
    filled: true,
    wireframe: true,
    lineWidthMinPixels: 1,
    getPolygon: function getPolygon(d) {
      return d.polygon;
    },
    getElevation: function getElevation() {
      return 1000;
    },
    getFillColor: function getFillColor() {
      return [0, 0, 0, 255];
    },
    getLineColor: function getLineColor() {
      return [80, 80, 80];
    },
    getLineWidth: 1
  }
}), _defineProperty(_LAYERS, TYPES.LINE, {
  required: [],
  defaults: {}
}), _defineProperty(_LAYERS, TYPES.SCATTERPLOT, {
  required: [],
  defaults: {}
}), _defineProperty(_LAYERS, TYPES.GEOJSON, {
  required: [],
  defaults: {}
}), _defineProperty(_LAYERS, TYPES.CLUSTER, {
  required: [],
  defaults: {}
}), _defineProperty(_LAYERS, TYPES.TILE, {
  required: [],
  defaults: {}
}), _defineProperty(_LAYERS, TYPES.TEXT, {
  required: [],
  defaults: {
    getSize: 32,
    getColor: [0, 0, 0, 255],
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'center',
    getPixelOffset: [0, 0],
    getBackgroundColor: [255, 255, 255, 255],
    getBorderColor: [0, 0, 0, 255],
    getBorderWidth: 0
  }
}), _defineProperty(_LAYERS, TYPES.TEXT_ICON, {
  required: ['iconAtlas', 'iconMapping'],
  defaults: {
    getSize: 32,
    getColor: [0, 0, 0, 255],
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'center',
    getPixelOffset: [0, 0],
    getBackgroundColor: [255, 255, 255, 255],
    getBorderColor: [0, 0, 0, 255],
    getBorderWidth: 0,
    pickable: true,
    sizeScale: 2000,
    sizeUnits: 'meters',
    getPosition: function getPosition(d) {
      return d.coordinates;
    },
    getIcon: function getIcon() {
      return 'marker';
    },
    sizeMinPixels: 16,
    sizeMaxPixels: 256,
    getText: function getText(d) {
      return d.label;
    },
    getAngle: 0,
    getTextSize: function getTextSize() {
      return 100;
    },
    getIconSize: function getIconSize() {
      return 32;
    },
    getTextColor: function getTextColor() {
      return [255, 255, 255];
    },
    getIconColor: function getIconColor() {
      return [255, 255, 255];
    }
  }
}), _defineProperty(_LAYERS, TYPES.HEXAGON, {
  required: [],
  defaults: {
    pickable: true,
    extruded: true,
    getPosition: function getPosition(d) {
      return d.coordinates;
    }
  }
}), _LAYERS);

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function getIconName(size) {
  if (size === 0) {
    return '';
  }

  if (size < 10) {
    return "marker-".concat(size);
  }

  if (size < 100) {
    return "marker-".concat(Math.floor(size / 10), "0");
  }

  return 'marker-100';
}

function getIconSize(size) {
  return Math.min(100, size) / 100 + 1;
}

var IconClusterLayer = /*#__PURE__*/function (_CompositeLayer) {
  _inherits(IconClusterLayer, _CompositeLayer);

  var _super = _createSuper(IconClusterLayer);

  function IconClusterLayer() {
    _classCallCheck(this, IconClusterLayer);

    return _super.apply(this, arguments);
  }

  _createClass(IconClusterLayer, [{
    key: "shouldUpdateState",
    value: function shouldUpdateState(_ref) {
      var changeFlags = _ref.changeFlags;
      return changeFlags.somethingChanged;
    }
  }, {
    key: "updateState",
    value: function updateState(_ref2) {
      var props = _ref2.props,
          oldProps = _ref2.oldProps,
          changeFlags = _ref2.changeFlags;
      var rebuildIndex = changeFlags.dataChanged || props.sizeScale !== oldProps.sizeScale;

      if (rebuildIndex) {
        var index = new Supercluster__default['default']({
          maxZoom: 16,
          radius: props.sizeScale
        });
        index.load(props.data.map(function (d) {
          return {
            geometry: {
              coordinates: props.getPosition(d)
            },
            properties: d
          };
        }));
        this.setState({
          index: index
        });
      }

      var z = Math.floor(this.context.viewport.zoom);

      if (rebuildIndex || z !== this.state.z) {
        this.setState({
          data: this.state.index.getClusters([-180, -85, 180, 85], z),
          z: z
        });
      }
    }
  }, {
    key: "getPickingInfo",
    value: function getPickingInfo(_ref3) {
      var info = _ref3.info,
          mode = _ref3.mode;
      var pickedObject = info.object && info.object.properties;

      if (pickedObject) {
        if (pickedObject.cluster && mode !== 'hover') {
          info.objects = this.state.index.getLeaves(pickedObject.cluster_id, 25).map(function (f) {
            return f.properties;
          });
        }

        info.object = pickedObject;
      }

      return info;
    }
  }, {
    key: "renderLayers",
    value: function renderLayers() {
      var data = this.state.data;
      var _this$props = this.props,
          iconAtlas = _this$props.iconAtlas,
          iconMapping = _this$props.iconMapping,
          sizeScale = _this$props.sizeScale;
      return new layers.IconLayer(this.getSubLayerProps({
        id: 'icon',
        data: data,
        iconAtlas: iconAtlas,
        iconMapping: iconMapping,
        sizeScale: sizeScale,
        getPosition: function getPosition(d) {
          return d.geometry.coordinates;
        },
        getIcon: function getIcon(d) {
          return getIconName(d.properties.cluster ? d.properties.point_count : 1);
        },
        getSize: function getSize(d) {
          return getIconSize(d.properties.cluster ? d.properties.point_count : 1);
        }
      }));
    }
  }]);

  return IconClusterLayer;
}(core.CompositeLayer);

var _globalState = {
  map: {
    layers: [],
    _rawLayers: {}
  }
};

var addMapState = function addMapState(mapKey) {
  _globalState[mapKey] = {
    layers: [],
    _rawLayers: {}
  };
};

var getGlobalDataFactory = function getGlobalDataFactory(mapIndex) {
  var _globalState$mapKey;

  var mapKey = "map".concat(mapIndex);

  if (!_globalState[mapKey]) {
    addMapState(mapKey);
  }

  return {
    getState: function getState() {
      return _globalState[mapKey];
    },
    setState: function setState(key, value) {
      if (Object.prototype.hasOwnProperty.call(_globalState[mapKey], key)) {
        _globalState[mapKey][key] = value;
      }
    },
    rawLayers: (_globalState$mapKey = _globalState[mapKey]) === null || _globalState$mapKey === void 0 ? void 0 : _globalState$mapKey._rawLayers,
    removeRawLayer: function removeRawLayer(id) {
      if (id) {
        var _globalState$mapKey2;

        (_globalState$mapKey2 = _globalState[mapKey]) === null || _globalState$mapKey2 === void 0 ? true : delete _globalState$mapKey2._rawLayers[id];
      } else {
        var _globalState$mapKey3;

        var props = Object.getOwnPropertyNames((_globalState$mapKey3 = _globalState[mapKey]) === null || _globalState$mapKey3 === void 0 ? void 0 : _globalState$mapKey3._rawLayers);

        for (var i = 0; i < props.length; i++) {
          var _globalState$mapKey4;

          (_globalState$mapKey4 = _globalState[mapKey]) === null || _globalState$mapKey4 === void 0 ? true : delete _globalState$mapKey4._rawLayers[props[i]];
        }
      }
    }
  };
};

window['_globalState'] = _globalState;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var LayersManager = function LayersManager(_ref) {
  _ref.initialLayers;
      var mapIndex = _ref.mapIndex;
  var globalDataFactory = getGlobalDataFactory(mapIndex);

  var _setLayers = function _setLayers(layers) {
    globalDataFactory.setState('layers', layers);
  };

  var _setRawLayers = function _setRawLayers(id, value) {
    globalDataFactory.rawLayers[id] = value;
  };

  var _removeRawLayers = function _removeRawLayers(id) {
    globalDataFactory.removeRawLayer(id);
  };

  var _getLayers = function _getLayers() {
    return globalDataFactory.getState().layers;
  };

  var _updateAndPlotLayers = function _updateAndPlotLayers(layers) {
    _setLayers(layers);

    _plotLayers(layers);
  };

  var _getMapGLInstance = function _getMapGLInstance() {
    var mapIndex = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    return window["mapGL".concat(mapIndex)];
  };

  var _validateMandatoryFields = function _validateMandatoryFields(type, layerConfig) {
    if (!LAYERS[type]) throwError('Type of layer requested is not supported.');
    LAYERS[type].required.forEach(function (field) {
      if (!layerConfig[field]) throwError("".concat(field, " is a mandatory param"));
    });
  };

  var _getIdByType = function _getIdByType(type, id) {
    if (!type) {
      throwError('type is a mandatory param');
    }

    if (!id) {
      throwError('id is a mandatory param');
    }

    return "".concat(type, "_").concat(id);
  };

  var _getLayerInstance = function _getLayerInstance(type) {
    var layerInstance;

    switch (type) {
      case TYPES.ICON:
        layerInstance = layers.IconLayer;
        break;

      case TYPES.TRIPS:
        layerInstance = geoLayers.TripsLayer;
        break;

      case TYPES.ARC:
        layerInstance = layers.ArcLayer;
        break;

      case TYPES.HEATMAP:
        layerInstance = aggregationLayers.HeatmapLayer;
        break;

      case TYPES.POLYGON:
        layerInstance = layers.PolygonLayer;
        break;

      case TYPES.SCATTERPLOT:
        layerInstance = layers.ScatterplotLayer;
        break;

      case TYPES.LINE:
        layerInstance = layers.LineLayer;
        break;

      case TYPES.GEOJSON:
        layerInstance = layers.GeoJsonLayer;
        break;

      case TYPES.CLUSTER:
        layerInstance = IconClusterLayer;
        break;

      case TYPES.TILE:
        layerInstance = geoLayers.TileLayer;
        break;

      case TYPES.TEXT:
        layerInstance = layers.TextLayer;
        break;

      case TYPES.HEXAGON:
        layerInstance = aggregationLayers.HexagonLayer;
        break;
    }

    return layerInstance;
  };

  var _getAllLayersIds = function _getAllLayersIds() {
    return _getLayers().map(function (_ref2) {
      var id = _ref2.id;
      return id;
    });
  };

  var _removeById = function _removeById(layerId) {
    var newLayers = _getLayers().filter(function (layer) {
      return layer.id !== layerId;
    });

    _updateAndPlotLayers(newLayers);
  };

  var _addLayer = function _addLayer(layerInput) {
    var type = layerInput.type,
        data = layerInput.data,
        layerConfig = layerInput.layerConfig;

    var layerId = _getIdByType(type, layerConfig.id);

    if (_getAllLayersIds().includes(layerId)) {
      _removeById(layerId);
    }

    _validateMandatoryFields(type, layerConfig);

    var LayerInstance = _getLayerInstance(type);

    var layer = new LayerInstance(_objectSpread(_objectSpread(_objectSpread({}, LAYERS[type].defaults), layerConfig), {}, {
      id: layerId,
      data: data
    }));

    var currentLayers = _getLayers();

    var updatedLayers = [].concat(_toConsumableArray(currentLayers), [layer]);

    _updateAndPlotLayers(updatedLayers);

    _setRawLayers(layerId, layerInput);
  };

  var _removeAll = function _removeAll() {
    _updateAndPlotLayers([]);

    _removeRawLayers();
  };

  var _removeLayer = function _removeLayer(_ref3) {
    var type = _ref3.type,
        id = _ref3.id;

    var layerId = _getIdByType(type, id);

    var filteredLayers = _getLayers().filter(function (layer) {
      return layer.id !== layerId;
    });

    _updateAndPlotLayers(filteredLayers);

    _removeRawLayers(layerId);
  };

  var _plotLayers = function _plotLayers(layers) {
    try {
      var _getMapGLInstance2;

      (_getMapGLInstance2 = _getMapGLInstance(mapIndex)) === null || _getMapGLInstance2 === void 0 ? void 0 : _getMapGLInstance2.map.mapOverlay._deck.setProps({
        layers: layers
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Error during plotting the layers', e.message);
    }
  };

  return {
    plot: _plotLayers,
    add: _addLayer,
    removeAll: _removeAll,
    remove: _removeLayer,
    mapControl: _getMapGLInstance(mapIndex)
  };
};

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime_1 = createCommonjsModule(function (module) {
var runtime = (function (exports) {

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined$1; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  define(Gp, "constructor", GeneratorFunctionPrototype);
  define(GeneratorFunctionPrototype, "constructor", GeneratorFunction);
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  });
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined$1) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined$1;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined$1;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  define(Gp, iteratorSymbol, function() {
    return this;
  });

  define(Gp, "toString", function() {
    return "[object Generator]";
  });

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined$1;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined$1, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined$1;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined$1;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined$1;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined$1;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined$1;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  module.exports 
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, in modern engines
  // we can explicitly access globalThis. In older engines we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}
});

var regenerator = runtime_1;

var getOptionsForCanvas = function getOptionsForCanvas(excludedClasses) {
  var pixelRatio = window.devicePixelRatio || 1;
  var _document$body = document.body,
      scrollHeight = _document$body.scrollHeight,
      scrollWidth = _document$body.scrollWidth;
  var ratio = pixelRatio < 2 ? pixelRatio : pixelRatio / 2;
  var width = scrollWidth * ratio;
  var height = scrollHeight * ratio;
  var googleMapClasses = ['gmnoprint', 'gm-style-pbc', 'gm-style-pbt', 'gm-control-active', 'gm-fullscreen-control', 'gm-bundled-control', 'gm-bundled-control-on-bottom', 'gm-svpc', 'gm-style-cc', 'gmnoscreen'];
  return {
    allowTaint: true,
    letterRendering: 1,
    quality: 1,
    width: width,
    height: height,
    useCORS: true,
    ignoreElements: function ignoreElements(element) {
      return element.className && [].concat(_toConsumableArray(excludedClasses), googleMapClasses).indexOf(element.className) > -1;
    }
  };
};

var exportImage = function exportImage(_, options) {
  var excludedClasses = (options === null || options === void 0 ? void 0 : options.excludedClasses) || [];
  var fileName = (options === null || options === void 0 ? void 0 : options.fileName) || 'map';
  html2canvas__default['default'](document.body, getOptionsForCanvas(excludedClasses)).then( /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(canvas) {
      var dataUrl, downloadLink;
      return regenerator.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              dataUrl = canvas.toDataURL();
              downloadLink = document.createElement('a');
              downloadLink.href = dataUrl;
              downloadLink.download = "".concat(fileName, " ").concat(getFileNameTimestamp(), ".jpg");
              downloadLink.click();
              return _context.abrupt("return");

            case 6:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }())["catch"](function (error) {
    // eslint-disable-next-line no-console
    console.log("Encountered in html2canvas parser ".concat(error));
  });
};

exports.LayersManager = LayersManager;
exports.MapGL = MapGL;
exports.exportImage = exportImage;
