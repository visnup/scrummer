/**
 * Title: jqPlot Charts
 * 
 * Pure JavaScript plotting plugin for jQuery.
 * 
 * About: Version
 * 
 * 0.9.4 
 * 
 * About: Copyright & License
 * 
 * Copyright (c) 2009 Chris Leonello.  This software is licensed under the GPL version 2.0 and MIT licenses.
 * See <GPL Version 2> and <MIT License> contained within this
 * distribution for further information.
 * 
 * About: Introduction
 * 
 * jqPlot requires jQuery (tested with 1.3.2 or better). jQuery 1.3.2 is included in the distribution.  
 * To use jqPlot include jQuery, the jqPlot jQuery plugin, the jqPlot css file and optionally 
 * the excanvas script for IE support in your web page:
 * 
 * > <!--[if IE]><script language="javascript" type="text/javascript" src="excanvas.js"></script><![endif]-->
 * > <script language="javascript" type="text/javascript" src="jquery-1.3.2.min.js"></script>
 * > <script language="javascript" type="text/javascript" src="jquery.jqplot.min.js"></script>
 * > <link rel="stylesheet" type="text/css" href="jquery.jqplot.css" />
 * 
 * jqPlot can be customized by overriding the defaults of any of the objects which make
 * up the plot. The general usage of jqplot is:
 * 
 * > chart = $.jqplot('targetElemId', [dataArray,...], {optionsObject});
 * 
 * The options available to jqplot are detailed in <jqPlot Options> in the jqPlotOptions.txt file.
 * 
 * An actual call to $.jqplot() may look like the 
 * examples below:
 * 
 * > chart = $.jqplot('chartdiv',  [[[1, 2],[3,5.12],[5,13.1],[7,33.6],[9,85.9],[11,219.9]]]);
 * 
 * or
 * 
 * > dataArray = [34,12,43,55,77];
 * > chart = $.jqplot('targetElemId', [dataArray, ...], {title:'My Plot', axes:{yaxis:{min:20, max:100}}});
 * 
 * For more inforrmation, see <jqPlot Usage>.
 * 
 * About: Usage
 * 
 * See <jqPlot Usage>
 * 
 * About: Available Options 
 * 
 * See <jqPlot Options> for a list of options available thorugh the options object (not complete yet!)
 * 
 * About: Options Usage
 * 
 * See <Options Tutorial>
 * 
 * About: Changes
 * 
 * See <Change Log>
 * 
**/

(function($) {
    // make sure undefined is undefined
    var undefined;

    /**
     * Class: $.jqplot
     * jQuery function called by the user to create a plot.
     *  
     * Parameters:
     * target - ID of target element to render the plot into.
     * data - an array of data series.
     * options - user defined options object.  See the individual classes for available options.
     */

    $.jqplot = function(target, data, options) {
        var _data, _options;
        
        // check to see if only 2 arguments were specified, what is what.
        if (data == null) {
            throw "No data specified";
        }
        if (data.constructor == Array && data.length == 0 || data[0].constructor != Array) {
            throw "Improper Data Array";
        }
        if (options == null) {
            if (data instanceof Array) {
                _data = data;
                _options = null;   
            }
            
            else if (data.constructor == Object) {
                _data = null;
                _options = data;
            }
        }
        else {
            _data = data;
            _options = options;
        }
        var plot = new jqPlot();
        plot.init(target, _data, _options);
        plot.draw();
        return plot;
    };
    
    // declare some commonly used iteration variables.
    
    $.jqplot.debug = 1;
    /**
     * 
     * Hooks: jqPlot Pugin Hooks
     * 
     * $.jqplot.preInitHooks - called before initialization.
     * $.jqplot.postInitHooks - called after initialization.
     * $.jqplot.preParseOptionsHooks - called before user options are parsed.
     * $.jqplot.postParseOptionsHooks - called after user options are parsed.
     * $.jqplot.preDrawHooks - called before plot draw.
     * $.jqplot.postDrawHooks - called after plot draw.
     * $.jqplot.preDrawSeriesHooks - called before each series is drawn.
     * $.jqplot.postDrawSeriesHooks - called after each series is drawn.
     * $.jqplot.preDrawLegendHooks - called before the legend is drawn.
     * $.jqplot.addLegendRowHooks - called at the end of legend draw, so plugins
     *     can add rows to the legend table.
     * $.jqplot.preSeriesInitHooks - called before series is initialized.
     * $.jqplot.postSeriesInitHooks - called after series is initialized.
     * $.jqplot.preParseSeriesOptionsHooks - called before series related options
     *     are parsed.
     * $.jqplot.postParseSeriesOptionsHooks - called after series related options
     *     are parsed.
     * $.jqplot.eventListenerHooks - called at the end of plot drawing, binds
     *     listeners to the event canvas which lays on top of the grid area.
     * $.jqplot.preDrawSeriesShadowHooks - called before series shadows are drawn.
     * $.jqplot.postDrawSeriesShadowHooks - called after series shadows are drawn.
     * 
     */
    
    $.jqplot.preInitHooks = [];
    $.jqplot.postInitHooks = [];
    $.jqplot.preParseOptionsHooks = [];
    $.jqplot.postParseOptionsHooks = [];
    $.jqplot.preDrawHooks = [];
    $.jqplot.postDrawHooks = [];
    $.jqplot.preDrawSeriesHooks = [];
    $.jqplot.postDrawSeriesHooks = [];
    $.jqplot.preDrawLegendHooks = [];
    $.jqplot.addLegendRowHooks = [];
    $.jqplot.preSeriesInitHooks = [];
    $.jqplot.postSeriesInitHooks = [];
    $.jqplot.preParseSeriesOptionsHooks = [];
    $.jqplot.postParseSeriesOptionsHooks = [];
    $.jqplot.eventListenerHooks = [];
    $.jqplot.preDrawSeriesShadowHooks = [];
    $.jqplot.postDrawSeriesShadowHooks = [];

    // A superclass holding some common properties and methods.
    $.jqplot.ElemContainer = function() {
        this._elem;
        this._plotWidth;
        this._plotHeight;
        this._plotDimensions = {height:null, width:null};
    };
    
    $.jqplot.ElemContainer.prototype.getWidth = function() {
        return this._elem.outerWidth(true);
    };
    
    $.jqplot.ElemContainer.prototype.getHeight = function() {
        return this._elem.outerHeight(true);
    };
    
    $.jqplot.ElemContainer.prototype.getPosition = function() {
        return this._elem.position();
    };
    
    $.jqplot.ElemContainer.prototype.getTop = function() {
        return this.getPosition().top;
    };
    
    $.jqplot.ElemContainer.prototype.getLeft = function() {
        return this.getPosition().left;
    };
    
    $.jqplot.ElemContainer.prototype.getBottom = function() {
        return this._elem.css('bottom');
    };
    
    $.jqplot.ElemContainer.prototype.getRight = function() {
        return this._elem.css('right');
    };
    

    /**
     * Class: Axis
     * An individual axis object.  Cannot be instantiated directly, but created
     * by the Plot oject.  Axis properties can be set or overriden by the 
     * options passed in from the user.
     * 
     */
    function Axis(name) {
        $.jqplot.ElemContainer.call(this);
        // Group: Properties
        //
        // Axes options are specified within an axes object at the top level of the 
        // plot options like so:
        // > {
        // >    axes: {
        // >        xaxis: {min: 5},
        // >        yaxis: {min: 2, max: 8, numberTicks:4},
        // >        x2axis: {pad: 1.5},
        // >        y2axis: {ticks:[22, 44, 66, 88]}
        // >        }
        // > }
        // There are 4 axes, 'xaxis', 'yaxis', 'x2axis', 'y2axis'.  Any or all of 
        // which may be specified.
        this.name = name;
        this._series = [];
        // prop: show
        // Wether to display the axis on the graph.
        this.show = false;
        // prop: tickRenderer
        // A class of a rendering engine for creating the ticks labels displayed on the plot, 
        // See <$.jqplot.AxisTickRenderer>.
        this.tickRenderer = $.jqplot.AxisTickRenderer;
        // prop: tickOptions
        // Options that will be passed to the tickRenderer, see <$.jqplot.AxisTickRenderer> options.
        this.tickOptions = {};
        // prop: labelRenderer
        // A class of a rendering engine for creating an axis label.
        this.labelRenderer = $.jqplot.AxisLabelRenderer;
        // prop: labelOptions
        // Options passed to the label renderer.
        this.labelOptions = {};
        // prop: label
        // Label for the axis
        this.label = null;
        // prop: showLabel
        // true to show the axis label.
        this.showLabel = true;
        // prop: min
        // minimum value of the axis (in data units, not pixels).
        this.min=null;
        // prop: max
        // maximum value of the axis (in data units, not pixels).
        this.max=null;
        // prop: autoscale
        // Autoscale the axis min and max values to provide sensible tick spacing.
        // If axis min or max are set, autoscale will be turned off.
        // The numberTicks, tickInterval and pad options do work with 
        // autoscale, although tickInterval has not been tested yet.
        // padMin and padMax do nothing when autoscale is on.
        this.autoscale = false;
        // prop: pad
        // Padding to extend the range above and below the data bounds.
        // The data range is multiplied by this factor to determine minimum and maximum axis bounds.
        // A value of 0 will be interpreted to mean no padding, and pad will be set to 1.0.
        this.pad = 1.2;
        // prop: padMax
        // Padding to extend the range above data bounds.
        // The top of the data range is multiplied by this factor to determine maximum axis bounds.
        // A value of 0 will be interpreted to mean no padding, and padMax will be set to 1.0.
        this.padMax = null;
        // prop: padMin
        // Padding to extend the range below data bounds.
        // The bottom of the data range is multiplied by this factor to determine minimum axis bounds.
        // A value of 0 will be interpreted to mean no padding, and padMin will be set to 1.0.
        this.padMin = null;
        // prop: ticks
        // 1D [val, val, ...] or 2D [[val, label], [val, label], ...] array of ticks for the axis.
        // If no label is specified, the value is formatted into an appropriate label.
        this.ticks = [];
        // prop: numberTicks
        // Desired number of ticks.  Default is to compute automatically.
        this.numberTicks;
        // prop: tickInterval
        // number of units between ticks.  Mutually exclusive with numberTicks.
        this.tickInterval;
        // prop: renderer
        // A class of a rendering engine that handles tick generation, 
        // scaling input data to pixel grid units and drawing the axis element.
        this.renderer = $.jqplot.LinearAxisRenderer;
        // prop: rendererOptions
        // renderer specific options.  See <$.jqplot.LinearAxisRenderer> for options.
        this.rendererOptions = {};
        // prop: showTicks
        // wether to show the ticks (both marks and labels) or not.
        this.showTicks = true;
        // prop: showTickMarks
        // wether to show the tick marks (line crossing grid) or not.
        this.showTickMarks = true;
        // prop: showMinorTicks
        // Wether or not to show minor ticks.  This is renderer dependent.
        // The default <$.jqplot.LinearAxisRenderer> does not have minor ticks.
        this.showMinorTicks = true;
        // prop: useSeriesColor
        // Use the color of the first series associated with this axis for the
        // tick marks and line bordering this axis.
        this.useSeriesColor = false;
        // prop: borderWidth
        // width of line stroked at the border of the axis.  Defaults
        // to the width of the grid boarder.
        this.borderWidth = null;
        // prop: borderColor
        // color of the border adjacent to the axis.  Defaults to grid border color.
        this.borderColor = null;
        // minimum and maximum values on the axis.
        this._dataBounds = {min:null, max:null};
        // pixel position from the top left of the min value and max value on the axis.
        this._offsets = {min:null, max:null};
        this._ticks=[];
        this._label = null;
    }
    
    Axis.prototype = new $.jqplot.ElemContainer();
    Axis.prototype.constructor = Axis;
    
    Axis.prototype.init = function() {
        this.renderer = new this.renderer();
        // set the axis name
        this.tickOptions.axis = this.name;
        if (this.label == null || this.label == '') {
            this.showLabel = false;
        }
        else {
            this.labelOptions.label = this.label;
        }
        if (this.showLabel == false) {
            this.labelOptions.show = false;
        }
        // set the default padMax, padMin if not specified
        // special check, if no padding desired, padding
        // should be set to 1.0
        if (this.pad == 0) {
            this.pad = 1.0;
        }
        if (this.padMax == 0) {
            this.padMax = 1.0;
        }
        if (this.padMin == 0) {
            this.padMin = 1.0;
        }
        if (this.padMax == null) {
            this.padMax = (this.pad-1)/2 + 1;
        }
        if (this.padMin == null) {
            this.padMin = (this.pad-1)/2 + 1;
        }
        if (this.min != null || this.max != null) {
            this.autoscale = false;
        }
        this.renderer.init.call(this, this.rendererOptions);
        
    };
    
    Axis.prototype.draw = function(ctx) {
        return this.renderer.draw.call(this, ctx);
    };
    
    Axis.prototype.set = function() {
        this.renderer.set.call(this);
    };
    
    Axis.prototype.pack = function(pos, offsets) {
        if (this.show) {
            this.renderer.pack.call(this, pos, offsets);
        }
    };

    /**
     * Class: Legend
     * Legend object.  Cannot be instantiated directly, but created
     * by the Plot oject.  Legend properties can be set or overriden by the 
     * options passed in from the user.
     */
    function Legend() {
        $.jqplot.ElemContainer.call(this);
        // Group: Properties
        
        // prop: show
        // Wether to display the legend on the graph.
        this.show = false;
        // prop: location
        // Placement of the legend.  one of the compass directions: nw, n, ne, e, se, s, sw, w
        this.location = 'ne';
        // prop: xoffset
        // offset from the inside edge of the plot in the x direction in pixels.
        this.xoffset = 12;
        // prop: yoffset
        // offset from the inside edge of the plot in the y direction in pixels.
        this.yoffset = 12;
        // prop: border
        // css spec for the border around the legend box.
        this.border;
        // prop: background
        // css spec for the background of the legend box.
        this.background;
        // prop: textColor
        // css color spec for the legend text.
        this.textColor;
        // prop: fontFamily
        // css font-family spec for the legend text.
        this.fontFamily; 
        // prop: fontSize
        // css font-size spec for the legend text.
        this.fontSize ;
        // prop: rowSpacing
        // css padding-top spec for the rows in the legend.
        this.rowSpacing = '0.5em';
        // renderer
        // A class that will create a DOM object for the legend,
        // see <$.jqplot.TableLegendRenderer>.
        this.renderer = $.jqplot.TableLegendRenderer;
        // prop: rendererOptions
        // renderer specific options passed to the renderer.
        this.rendererOptions = {};
        // prop: predraw
        // Wether to draw the legend before the series or not.
        this.preDraw = false;
        this.escapeHtml = false;
        this._series = [];
    }
    
    Legend.prototype = new $.jqplot.ElemContainer();
    Legend.prototype.constructor = Legend;
    
    Legend.prototype.init = function() {
        this.renderer = new this.renderer();
        this.renderer.init.call(this, this.rendererOptions);
    };
    
    Legend.prototype.draw = function(offsets) {
        for (var i=0; i<$.jqplot.preDrawLegendHooks.length; i++){
            $.jqplot.preDrawLegendHooks[i].call(this, offsets);
        }
        return this.renderer.draw.call(this, offsets);
    };
    
    Legend.prototype.pack = function(offsets) {
        this.renderer.pack.call(this, offsets);
    };
    
    $.jqplot.TableLegendRenderer = function(){
        //
    };

    /**
     * Class: Title
     * Plot Title object.  Cannot be instantiated directly, but created
     * by the Plot oject.  Title properties can be set or overriden by the 
     * options passed in from the user.
     * 
     * Parameters:
     * text - text of the title.
     */
    function Title(text) {
        $.jqplot.ElemContainer.call(this);
        // Group: Properties
        
        // prop: text
        // text of the title;
        this.text = text;
        // prop: show
        // wether or not to show the title
        this.show = true;
        // prop: fontFamily
        // css font-family spec for the text.
        this.fontFamily;
        // prop: fontSize
        // css font-size spec for the text.
        this.fontSize ;
        // prop: textAlign
        // css text-align spec for the text.
        this.textAlign;
        // prop: textColor
        // css color spec for the text.
        this.textColor;
        // prop: renderer
        // A class for creating a DOM element for the title,
        // see <$.jqplot.DivTitleRenderer>.
        this.renderer = $.jqplot.DivTitleRenderer;
        // prop: rendererOptions
        // renderer specific options passed to the renderer.
        this.rendererOptions = {};   
    }
    
    Title.prototype = new $.jqplot.ElemContainer();
    Title.prototype.constructor = Title;
    
    Title.prototype.init = function() {
        this.renderer = new this.renderer();
        this.renderer.init.call(this, this.rendererOptions);
    };
    
    Title.prototype.draw = function(width) {
        return this.renderer.draw.call(this, width);
    };
    
    Title.prototype.pack = function() {
        this.renderer.pack.call(this);
    };


    /**
     * Class: Series
     * An individual data series object.  Cannot be instantiated directly, but created
     * by the Plot oject.  Series properties can be set or overriden by the 
     * options passed in from the user.
     */
    function Series() {
        $.jqplot.ElemContainer.call(this);
        // Group: Properties
        // Properties will be assigned from a series array at the top level of the
        // options.  If you had two series and wanted to change the color and line
        // width of the first and set the second to use the secondary y axis with
        // no shadow and supply custom labels for each:
        // > {
        // >    series:[
        // >        {color: '#ff4466', lineWidth: 5, label:'good line'},
        // >        {yaxis: 'y2axis', shadow: false, label:'bad line'}
        // >    ]
        // > }
        
        // prop: show
        // wether or not to draw the series.
        this.show = true;
        // prop: xaxis
        // which x axis to use with this series, either 'xaxis' or 'x2axis'.
        this.xaxis = 'xaxis';
        this._xaxis;
        // prop: yaxis
        // which y axis to use with this series, either 'yaxis' or 'y2axis'.
        this.yaxis = 'yaxis';
        this._yaxis;
        this.gridBorderWidth = 2.0;
        // prop: renderer
        // A class of a renderer which will draw the series, 
        // see <$.jqplot.LineRenderer>.
        this.renderer = $.jqplot.LineRenderer;
        // prop: rendererOptions
        // Options to pass on to the renderer.
        this.rendererOptions = {};
        this.data = [];
        this.gridData = [];
        // prop: label
        // Line label to use in the legend.
        this.label = '';
        // prop: color
        // css color spec for the series
        this.color;
        // prop: lineWidth
        // width of the line in pixels.  May have different meanings depending on renderer.
        this.lineWidth = 2.5;
        // prop: shadow
        // wether or not to draw a shadow on the line
        this.shadow = true;
        // prop: shadowAngle
        // Shadow angle in degrees
        this.shadowAngle = 45;
        // prop: shadowOffset
        // Shadow offset from line in pixels
        this.shadowOffset = 1.25;
        // prop: shadowDepth
        // Number of times shadow is stroked, each stroke offset shadowOffset from the last.
        this.shadowDepth = 3;
        // prop: shadowAlpha
        // Alpha channel transparency of shadow.  0 = transparent.
        this.shadowAlpha = '0.1';
        // prop: breakOnNull
        // Not implemented. wether line segments should be be broken at null value.
        // False will join point on either side of line.
        this.breakOnNull = false;
        // prop: markerRenderer
        // A class of a renderer which will draw marker (e.g. circle, square, ...) at the data points,
        // see <$.jqplot.MarkerRenderer>.
        this.markerRenderer = $.jqplot.MarkerRenderer;
        // prop: markerOptions
        // renderer specific options to pass to the markerRenderer,
        // see <$.jqplot.MarkerRenderer>.
        this.markerOptions = {};
        // prop: showLine
        // wether to actually draw the line or not.  Series will still be renderered, even if no line is drawn.
        this.showLine = true;
        // prop: showMarker
        // wether or not to show the markers at the data points.
        this.showMarker = true;
        // prop: index
        // 0 based index of this series in the plot series array.
        this.index;
        // prop: fill
        // true or false, wether to fill under lines or in bars.
        // May not be implemented in all renderers.
        this.fill = false;
        // prop: fillColor
        // CSS color spec to use for fill under line.  Defaults to line color.
        this.fillColor;
        // prop: fillAlpha
        // Alpha transparency to apply to the fill under the line.
        // Use this to adjust alpha separate from fill color.
        this.fillAlpha;
        // prop: fillAndStroke
        // If true will stroke the line (with color this.color) as well as fill under it.
        // Applies only when fill is true.
        this.fillAndStroke = false;
        // _stack is set by the Plot if the plot is a stacked chart.
        // will stack lines or bars on top of one another to build a "mountain" style chart.
        // May not be implemented in all renderers.
        this._stack = false;
        // prop: neighborThreshold
        // how close or far (in pixels) the cursor must be from a point marker to detect the point.
        this.neighborThreshold = 4;
        this._stackData = [];
        this._plotData = [];
        // data from the previous series, for stacked charts.
        this._prevPlotData = [];
        this._prevGridData = [];
        this._stackAxis = 'y';
        this._primaryAxis = '_xaxis';
        this.plugins = {};
    }
    
    Series.prototype = new $.jqplot.ElemContainer();
    Series.prototype.constructor = Series;
    
    Series.prototype.init = function(index, gridbw) {
        // weed out any null values in the data.
        this.index = index;
        this.gridBorderWidth = gridbw;
        var d = this.data;
        for (var i=0; i<d.length; i++) {
            if (! this.breakOnNull) {
                if (d[i] == null || d[i][0] == null || d[i][1] == null) {
                    d.splice(i,1);
                    continue;
                }
            }
            else {
                if (d[i] == null || d[i][0] == null || d[i][1] == null) {
                    // TODO: figure out what to do with null values
                    var undefined;
                }
            }
        }
        if (!this.fillColor) {
            this.fillColor = this.color;
        }
        if (this.fillAlpha) {
            var comp = $.jqplot.normalize2rgb(this.fillColor);
            var comp = $.jqplot.getColorComponents(comp);
            this.fillColor = 'rgba('+comp[0]+','+comp[1]+','+comp[2]+','+this.fillAlpha+')';
        }
        this.renderer = new this.renderer();
        this.renderer.init.call(this, this.rendererOptions);
        this.markerRenderer = new this.markerRenderer();
        if (!this.markerOptions.color) {
            this.markerOptions.color = this.color;
        }
        if (this.markerOptions.show == null) {
            this.markerOptions.show = this.showMarker;
        }
        // the markerRenderer is called within it's own scaope, don't want to overwrite series options!!
        this.markerRenderer.init(this.markerOptions);
    };
    
    // data - optional data point array to draw using this series renderer
    // gridData - optional grid data point array to draw using this series renderer
    // stackData - array of cumulative data for stacked plots.
    Series.prototype.draw = function(sctx, opts) {
        var options = (opts == undefined) ? {} : opts;
        // hooks get called even if series not shown
        // we don't clear canvas here, it would wipe out all other series as well.
        for (var j=0; j<$.jqplot.preDrawSeriesHooks.length; j++) {
            $.jqplot.preDrawSeriesHooks[j].call(this, sctx, options);
        }
        if (this.show) {
            this.renderer.setGridData.call(this);
            if (!options.preventJqPlotSeriesDrawTrigger) {
                $(sctx.canvas).trigger('jqplotSeriesDraw', [this.data, this.gridData]);
            }
            var data = [];
            if (options.data) {
                data = options.data;
            }
            else if (!this._stack) {
                data = this.data;
            }
            else {
                data = this._plotData;
            }
            // console.log('plotdata before: %s', this._plotData);
            var gridData = options.gridData || this.renderer.makeGridData.call(this, data);
            // console.log('plotdata after: %s', this._plotData);
            // console.log('data:%s | gridData: %s', data, gridData);
            
            this.renderer.draw.call(this, sctx, gridData, options);
        }
        
        for (var j=0; j<$.jqplot.postDrawSeriesHooks.length; j++) {
            $.jqplot.postDrawSeriesHooks[j].call(this, sctx, options);
        }
    };
    
    Series.prototype.drawShadow = function(sctx, opts) {
        var options = (opts == undefined) ? {} : opts;
        // hooks get called even if series not shown
        // we don't clear canvas here, it would wipe out all other series as well.
        for (var j=0; j<$.jqplot.preDrawSeriesShadowHooks.length; j++) {
            $.jqplot.preDrawSeriesShadowHooks[j].call(this, sctx, options);
        }
        if (this.shadow) {
            this.renderer.setGridData.call(this);

            var data = [];
            if (options.data) {
                data = options.data;
            }
            else if (!this._stack) {
                data = this.data;
            }
            else {
                data = this._plotData;
            }
            var gridData = options.gridData || this.renderer.makeGridData.call(this, data);
        
            this.renderer.drawShadow.call(this, sctx, gridData, options);
        }
        
        for (var j=0; j<$.jqplot.postDrawSeriesShadowHooks.length; j++) {
            $.jqplot.postDrawSeriesShadowHooks[j].call(this, sctx, options);
        }
        
    };
    


    /**
     * Class: Grid
     * 
     * Object representing the grid on which the plot is drawn.  The grid in this
     * context is the area bounded by the axes, the area which will contain the series.
     * Note, the series are drawn on their own canvas.
     * The Grid object cannot be instantiated directly, but is created by the Plot oject.  
     * Grid properties can be set or overriden by the options passed in from the user.
     */
    function Grid() {
        $.jqplot.ElemContainer.call(this);
        // Group: Properties
        
        // prop: drawGridlines
        // wether to draw the gridlines on the plot.
        this.drawGridlines = true;
        // prop: gridLineColor
        // color of the grid lines.
        this.gridLineColor = '#cccccc';
        // prop: gridLineWidth
        // width of the grid lines.
        this.gridLineWidth = 1.0;
        // prop: background
        // css spec for the background color.
        this.background = '#fffdf6';
        // prop: borderColor
        // css spec for the color of the grid border.
        this.borderColor = '#999999';
        // prop: borderWidth
        // width of the border in pixels.
        this.borderWidth = 2.0;
        // prop: shadow
        // wether to show a shadow behind the grid.
        this.shadow = true;
        // prop: shadowAngle
        // shadow angle in degrees
        this.shadowAngle = 45;
        // prop: shadowOffset
        // Offset of each shadow stroke from the border in pixels
        this.shadowOffset = 1.5;
        // prop: shadowWidth
        // width of the stoke for the shadow
        this.shadowWidth = 3;
        // prop: shadowDepth
        // Number of times shadow is stroked, each stroke offset shadowOffset from the last.
        this.shadowDepth = 3;
        // prop: shadowAlpha
        // Alpha channel transparency of shadow.  0 = transparent.
        this.shadowAlpha = '0.07';
        this._left;
        this._top;
        this._right;
        this._bottom;
        this._width;
        this._height;
        this._axes = [];
        // prop: renderer
        // Instance of a renderer which will actually render the grid,
        // see <$.jqplot.CanvasGridRenderer>.
        this.renderer = $.jqplot.CanvasGridRenderer;
        // prop: rendererOptions
        // Options to pass on to the renderer,
        // see <$.jqplot.CanvasGridRenderer>.
        this.rendererOptions = {};
        this._offsets = {top:null, bottom:null, left:null, right:null};
    }
    
    Grid.prototype = new $.jqplot.ElemContainer();
    Grid.prototype.constructor = Grid;
    
    Grid.prototype.init = function() {
        this.renderer = new this.renderer();
        this.renderer.init.call(this, this.rendererOptions);
    };
    
    Grid.prototype.createElement = function(offsets) {
        this._offsets = offsets;
        return this.renderer.createElement.call(this);
    };
    
    Grid.prototype.draw = function() {
        this.renderer.draw.call(this);
    };
    
    $.jqplot.GenericCanvas = function() {
        $.jqplot.ElemContainer.call(this);
        this._ctx;  
    };
    
    $.jqplot.GenericCanvas.prototype = new $.jqplot.ElemContainer();
    $.jqplot.GenericCanvas.prototype.constructor = $.jqplot.GenericCanvas;
    
    $.jqplot.GenericCanvas.prototype.createElement = function(offsets, clss, plotDimensions) {
        this._offsets = offsets;
        var klass = 'jqplot';
        if (clss != undefined) {
            klass = clss;
        }
        var elem = document.createElement('canvas');
        // if new plotDimensions supplied, use them.
        if (plotDimensions != undefined) {
            this._plotDimensions = plotDimensions;
        }
        elem.width = this._plotDimensions.width - this._offsets.left - this._offsets.right;
        elem.height = this._plotDimensions.height - this._offsets.top - this._offsets.bottom;
        this._elem = $(elem);
        this._elem.addClass(klass);
        this._elem.css({ position: 'absolute', left: this._offsets.left, top: this._offsets.top });
        // borrowed from flot by Ole Laursen
        if ($.browser.msie) {
            window.G_vmlCanvasManager.init_(document);
        }
        if ($.browser.msie) {
            elem = window.G_vmlCanvasManager.initElement(elem);
        }
        return this._elem;
    };
    
    $.jqplot.GenericCanvas.prototype.setContext = function() {
        this._ctx = this._elem.get(0).getContext("2d");
        return this._ctx;
    };

    /**
     * Class: jqPlot
     * Plot object returned by call to $.jqplot.  Handles parsing user options,
     * creating sub objects (Axes, legend, title, series) and rendering the plot.
     */
    function jqPlot() {
        // Group: Properties
        // These properties are specified at the top of the options object
        // like so:
        // > {
        // >     axesDefaults:{min:0},
        // >     series:[{color:'#6633dd'}],
        // >     title: 'A Plot'
        // > }
        //
        // prop: data
        // user's data.  Data should *NOT* be specified in the options object,
        // but be passed in as the second argument to the $.jqplot() function.
        // The data property is described here soley for reference. 
        // The data should be in the form of an array of 2D or 1D arrays like
        // > [ [[x1, y1], [x2, y2],...], [y1, y2, ...] ].
        this.data = [];
        // The id of the dom element to render the plot into
        this.targetId = null;
        // the jquery object for the dom target.
        this.target = null; 
        this.defaults = {
            // prop: axesDefaults
            // default options that will be applied to all axes.
            // see <Axis> for axes options.
            axesDefaults: {},
            axes: {xaxis:{}, yaxis:{}, x2axis:{}, y2axis:{}, y3axis:{}, y4axis:{}, y5axis:{}, y6axis:{}, y7axis:{}, y8axis:{}, y9axis:{}},
            // prop: seriesDefaults
            // default options that will be applied to all series.
            // see <Series> for series options.
            seriesDefaults: {},
            gridPadding: {top:10, right:10, bottom:10, left:10},
            series:[]
        };
        // prop: series
        // Array of series object options.
        // see <Series> for series specific options.
        this.series = [];
        // prop: axes
        // up to 4 axes are supported, each with it's own options, 
        // See <Axis> for axis specific options.
        this.axes = {xaxis: new Axis('xaxis'), yaxis: new Axis('yaxis'), x2axis: new Axis('x2axis'), y2axis: new Axis('y2axis'), y3axis: new Axis('y3axis'), y4axis: new Axis('y4axis'), y5axis: new Axis('y5axis'), y6axis: new Axis('y6axis'), y7axis: new Axis('y7axis'), y8axis: new Axis('y8axis'), y9axis: new Axis('y9axis')};
        // prop: grid
        // See <Grid> for grid specific options.
        this.grid = new Grid();
        // prop: legend
        // see <$.jqplot.TableLegendRenderer>
        this.legend = new Legend();
        this.baseCanvas = new $.jqplot.GenericCanvas();
        this.seriesCanvas = new $.jqplot.GenericCanvas();
        this.eventCanvas = new $.jqplot.GenericCanvas();
        this._width = null;
        this._height = null; 
        this._plotDimensions = {height:null, width:null};
        this._gridPadding = {top:10, right:10, bottom:10, left:10};
        // don't think this is implemented.
        this.equalXTicks = true;
        // don't think this is implemented.
        this.equalYTicks = true;
        // prop: seriesColors
        // Ann array of CSS color specifications that will be applied, in order,
        // to the series in the plot.  Colors will wrap around so, if their
        // are more series than colors, colors will be reused starting at the
        // beginning.  For pie charts, this specifies the colors of the slices.
        this.seriesColors = [ "#4bb2c5", "#EAA228", "#c5b47f", "#579575", "#839557", "#958c12", "#953579", "#4b5de4", "#d8b83f", "#ff5800", "#0085cc"];
        // prop: sortData
        // false to not sort the data passed in by the user.
        // Many bar, stakced and other graphs as well as many plugins depend on
        // having sorted data.
        this.sortData = true;
        var seriesColorsIndex = 0;
        // prop textColor
        // css spec for the css color attribute.  Default for the entire plot.
        this.textColor;
        // prop; fontFamily
        // css spec for the font-family attribute.  Default for the entire plot.
        this.fontFamily;
        // prop: fontSize
        // css spec for the font-size attribute.  Default for the entire plot.
        this.fontSize;
        // prop: title
        // Title object.  See <Title> for specific options.  As a shortcut, you
        // can specify the title option as just a string like: title: 'My Plot'
        // and this will create a new title object with the specified text.
        this.title = new Title();
        // container to hold all of the merged options.  Convienence for plugins.
        this.options = {};
        // prop: stackSeries
        // true or false, creates a stack or "mountain" plot.
        // Not all series renderers may implement this option.
        this.stackSeries = false;
        // array to hold the cumulative stacked series data.
        // used to ajust the individual series data, which won't have access to other
        // series data.
        this._stackData = [];
        // array that holds the data to be plotted. This will be the series data
        // merged with the the appropriate data from _stackData according to the stackAxis.
        this._plotData = [];
        // Namespece to hold plugins.  Generally non-renderer plugins add themselves to here.
        this.plugins = {};
        
        this.colorGenerator = ColorGenerator;
        
        // Group: methods
        //
        // method: init
        // sets the plot target, checks data and applies user
        // options to plot.
        this.init = function(target, data, options) {
            for (var i=0; i<$.jqplot.preInitHooks.length; i++) {
                $.jqplot.preInitHooks[i].call(this, target, data, options);
            }
            this.targetId = target;
            this.target = $('#'+target);
            if (!this.target.get(0)) {
                throw "No plot target specified";
            }
            
            // make sure the target is positioned by some means and set css
            if (this.target.css('position') == 'static') {
                this.target.css('position', 'relative');
            }
            if (!this.target.hasClass('jqplot-target')) {
                this.target.addClass('jqplot-target');
            }
            
            // if no height or width specified, use a default.
            if (!this.target.height()) {
                this._height = 300;
                this.target.css('height', '300px');
            }
            else {
                this._height = this.target.height();
            }
            if (!this.target.width()) {
                this._width = 400;
                this.target.css('width', '400px');
            }
            else {
                this._width = this.target.width();
            }
            
            this._plotDimensions.height = this._height;
            this._plotDimensions.width = this._width;
            this.grid._plotDimensions = this._plotDimensions;
            this.title._plotDimensions = this._plotDimensions;
            this.baseCanvas._plotDimensions = this._plotDimensions;
            this.seriesCanvas._plotDimensions = this._plotDimensions;
            this.eventCanvas._plotDimensions = this._plotDimensions;
            this.legend._plotDimensions = this._plotDimensions;
            if (this._height <=0 || this._width <=0 || !this._height || !this._width) {
                throw "Canvas dimensions <=0";
            }
            
            this.data = data;
            
            this.parseOptions(options);
            
            if (this.textColor) {
                this.target.css('color', this.textColor);
            }
            if (this.fontFamily) {
                this.target.css('font-family', this.fontFamily);
            }
            if (this.fontSize) {
                this.target.css('font-size', this.fontSize);
            }
            
            this.title.init();
            this.legend.init();
            for (var i=0; i<this.series.length; i++) {
                for (var j=0; j<$.jqplot.preSeriesInitHooks.length; j++) {
                    $.jqplot.preSeriesInitHooks[j].call(this.series[i], target, data, this.options.seriesDefaults, this.options.series[i]);
                }
                this.populatePlotData(this.series[i], i);
                this.series[i]._plotDimensions = this._plotDimensions;
                this.series[i].init(i, this.grid.borderWidth);
                for (var j=0; j<$.jqplot.postSeriesInitHooks.length; j++) {
                    $.jqplot.postSeriesInitHooks[j].call(this.series[i], target, data, this.options.seriesDefaults, this.options.series[i]);
                }
            }

            for (var name in this.axes) {
                this.axes[name]._plotDimensions = this._plotDimensions;
                this.axes[name].init();
            }
            
            if (this.sortData) {
                sortData(this.series);
            }
            this.grid.init();
            this.grid._axes = this.axes;
            
            this.legend._series = this.series;

            for (var i=0; i<$.jqplot.postInitHooks.length; i++) {
                $.jqplot.postInitHooks[i].call(this, target, data, options);
            }
        };  
        
        // sort the series data in increasing order.
        function sortData(series) {
            var d;
            for (var i=0; i<series.length; i++) {
                d = series[i].data;
                if (series[i]._stackAxis == 'x') {
                    d.sort(function(a,b){
                        var ret = a[1] - b[1];
                        if (ret) {
                            return ret;
                        }
                        return 0;
                    });
                }
                else {
                    d.sort(function(a,b){
                        var ret = a[0] - b[0];
                        if (ret) {
                            return ret;
                        }
                        return 0;
                    });
                }
            }
        }
        
        // populate the _stackData and _plotData arrays for the plot and the series.
        this.populatePlotData = function(series, index) {
            // if a stacked chart, compute the stacked data
            this._plotData = [];
            this._stackData = [];
            series._stackData = [];
            series._plotData = [];
            if (this.stackSeries) {
                series._stack = true;
                var sidx = series._stackAxis == 'x' ? 0 : 1;
                var idx = sidx ? 0 : 1;
                // push the current data into stackData
                //this._stackData.push(this.series[i].data);
                var temp = $.extend(true, [], series.data);
                // create the data that will be plotted for this series
                var plotdata = $.extend(true, [], series.data);
                // for first series, nothing to add to stackData.
                for (var j=0; j<index; j++) {
                    var cd = this.series[j].data;
                    for (var k=0; k<cd.length; k++) {
                        temp[k][0] += cd[k][0];
                        temp[k][1] += cd[k][1];
                        // only need to sum up the stack axis column of data
                        plotdata[k][sidx] += cd[k][sidx];
                    }
                }
                this._plotData.push(plotdata);
                this._stackData.push(temp);
                series._stackData = temp;
                series._plotData = plotdata;
            }
            else {
                this._stackData.push(series.data);
                this.series[index]._stackData = series.data;
                this._plotData.push(series.data);
                series._plotData = series.data;
            }
            if (index>0) {
                series._prevPlotData = this.series[index-1]._plotData;
            }
        };
        
        // function to safely return colors from the color array and wrap around at the end.
        this.getNextSeriesColor = (function(t) {
            var idx = 0;
            var sc = t.seriesColors;
            
            return function () { 
                if (idx < sc.length) {
                    return sc[idx++];
                }
                else {
                    idx = 0;
                    return sc[idx++];
                }
            };
        })(this);
    
        this.parseOptions = function(options){
            for (var i=0; i<$.jqplot.preParseOptionsHooks.length; i++) {
                $.jqplot.preParseOptionsHooks[i].call(this, options);
            }
            this.options = $.extend(true, {}, this.defaults, options);
            this.stackSeries = this.options.stackSeries;
            if (this.options.seriesColors) {
                this.seriesColors = this.options.seriesColors;
            }
            var cg = new this.colorGenerator(this.seriesColors);
            this._gridPadding = this.options.gridPadding;
            this.sortData = (this.options.sortData != null) ? this.options.sortData : this.sortData;
            for (var n in this.axes) {
                var axis = this.axes[n];
                $.extend(true, axis, this.options.axesDefaults, this.options.axes[n]);
                axis._plotWidth = this._width;
                axis._plotHeight = this._height;
            }
            if (this.data.length == 0) {
                this.data = [];
                for (var i=0; i<this.options.series.length; i++) {
                    this.data.push(this.options.series.data);
                }    
            }
                
            var normalizeData = function(data) {
                // return data as an array of point arrays,
                // in form [[x1,y1...], [x2,y2...], ...]
                var temp = [];
                var i;
                if (!(data[0] instanceof Array)) {
                    // we have a series of scalars.  One line with just y values.
                    // turn the scalar list of data into a data array of form:
                    // [[1, data[0]], [2, data[1]], ...]
                    for (var i=0; i<data.length; i++) {
                        temp.push([i+1, data[i]]);
                    }
                }
            
                else {
                    // we have a properly formatted data series, copy it.
                    $.extend(true, temp, data);
                }
                return temp;
            };

            for (var i=0; i<this.data.length; i++) { 
                var temp = new Series();
                for (var j=0; j<$.jqplot.preParseSeriesOptionsHooks.length; j++) {
                    $.jqplot.preParseSeriesOptionsHooks[j].call(temp, this.options.seriesDefaults, this.options.series[i]);
                }
                $.extend(true, temp, this.options.seriesDefaults, this.options.series[i]);
                temp.data = normalizeData(this.data[i]);
                switch (temp.xaxis) {
                    case 'xaxis':
                        temp._xaxis = this.axes.xaxis;
                        break;
                    case 'x2axis':
                        temp._xaxis = this.axes.x2axis;
                        break;
                    default:
                        break;
                }
                temp._yaxis = this.axes[temp.yaxis];
                temp._xaxis._series.push(temp);
                temp._yaxis._series.push(temp);
                if (temp.show) {
                    temp._xaxis.show = true;
                    temp._yaxis.show = true;
                }

                // parse the renderer options and apply default colors if not provided
                if (!temp.color && temp.show != false) {
                    temp.color = cg.next();
                }
                if (!temp.label) {
                    temp.label = 'Series '+ (i+1).toString();
                }
                // temp.rendererOptions.show = temp.show;
                // $.extend(true, temp.renderer, {color:this.seriesColors[i]}, this.rendererOptions);
                this.series.push(temp);  
                for (var j=0; j<$.jqplot.postParseSeriesOptionsHooks.length; j++) {
                    $.jqplot.postParseSeriesOptionsHooks[j].call(this.series[i], this.options.seriesDefaults, this.options.series[i]);
                }
            }
            
            // copy the grid and title options into this object.
            $.extend(true, this.grid, this.options.grid);
            // if axis border properties aren't set, set default.
            for (var n in this.axes) {
                var axis = this.axes[n];
                if (axis.borderWidth == null) {
                    axis.borderWidth =this.grid.borderWidth;
                }
                if (axis.borderColor == null) {
                    if (n != 'xaxis' && n != 'x2axis' && axis.useSeriesColor === true && axis.show) {
                        axis.borderColor = axis._series[0].color;
                    }
                    else {
                        axis.borderColor = this.grid.borderColor;
                    }
                }
            }
            
            if (typeof this.options.title == 'string') {
                this.title.text = this.options.title;
            }
            else if (typeof this.options.title == 'object') {
                $.extend(true, this.title, this.options.title);
            }
            this.title._plotWidth = this._width;
            $.extend(true, this.legend, this.options.legend);
            
            for (var i=0; i<$.jqplot.postParseOptionsHooks.length; i++) {
                $.jqplot.postParseOptionsHooks[i].call(this, options);
            }
        };
        
        
        // method: redraw
        // Empties the plot target div and redraws the plot.
        // This enables plot data and properties to be changed
        // and then to comletely clear the plot and redraw.
        // redraw *will not* reinitialize any plot elements.
        // That is, axes will not be autoscaled and defaults
        // will not be reapplied to any plot elements. 
        this.redraw = function() {
            this.target.trigger('jqplotPreRedraw');
            this.target.empty();
             for (var ax in this.axes) {
                this.axes[ax]._ticks = [];
    	    }
            for (var i=0; i<this.series.length; i++) {
                this.populatePlotData(this.series[i], i);
            }
            this.draw();
            this.target.trigger('jqplotPostRedraw');
        };
        
        // method: draw
        // Draws all elements of the plot into the container.
        // Does not clear the container before drawing.
        this.draw = function(){
            this.target.trigger('jqplotPreDraw');
            for (var i=0; i<$.jqplot.preDrawHooks.length; i++) {
                $.jqplot.preDrawHooks[i].call(this);
            }
            // create an underlying canvas to be used for special features.
            this.target.append(this.baseCanvas.createElement({left:0, right:0, top:0, bottom:0}, 'jqplot-base-canvas'));
            var bctx = this.baseCanvas.setContext();
            this.target.append(this.title.draw());
            this.title.pack({top:0, left:0});
            for (var name in this.axes) {
                this.target.append(this.axes[name].draw(bctx));
                this.axes[name].set();
            }
            if (this.axes.yaxis.show) {
                this._gridPadding.left = this.axes.yaxis.getWidth();
            }
            var ra = ['y2axis', 'y3axis', 'y4axis', 'y5axis', 'y6axis', 'y7axis', 'y8axis', 'y9axis'];
            var rapad = [0, 0, 0, 0];
            var gpr = 0;
            for (var n=8; n>0; n--) {
                var ax = this.axes[ra[n-1]];
                if (ax.show) {
                    rapad[n-1] = gpr;
                    gpr += ax.getWidth();
                }
            }
            if (gpr > this._gridPadding.right) {
                this._gridPadding.right = gpr;
            }
            if (this.title.show && this.axes.x2axis.show) {
                this._gridPadding.top = this.title.getHeight() + this.axes.x2axis.getHeight();
            }
            else if (this.title.show) {
                this._gridPadding.top = this.title.getHeight();
            }
            else if (this.axes.x2axis.show) {
                this._gridPadding.top = this.axes.x2axis.getHeight();
            }
            if (this.axes.xaxis.show) {
                this._gridPadding.bottom = this.axes.xaxis.getHeight();
            }
            
            this.axes.xaxis.pack({position:'absolute', bottom:0, left:0, width:this._width}, {min:this._gridPadding.left, max:this._width - this._gridPadding.right});
            this.axes.yaxis.pack({position:'absolute', top:0, left:0, height:this._height}, {min:this._height - this._gridPadding.bottom, max: this._gridPadding.top});
            this.axes.x2axis.pack({position:'absolute', top:this.title.getHeight(), left:0, width:this._width}, {min:this._gridPadding.left, max:this._width - this._gridPadding.right});
            for (var i=8; i>0; i--) {
                this.axes[ra[i-1]].pack({position:'absolute', top:0, right:rapad[i-1]}, {min:this._height - this._gridPadding.bottom, max: this._gridPadding.top});
            }
            // this.axes.y2axis.pack({position:'absolute', top:0, right:0}, {min:this._height - this._gridPadding.bottom, max: this._gridPadding.top});
            
            this.target.append(this.grid.createElement(this._gridPadding));
            this.grid.draw();
            this.target.append(this.seriesCanvas.createElement(this._gridPadding, 'jqplot-series-canvas'));
            var sctx = this.seriesCanvas.setContext();
            this.target.append(this.eventCanvas.createElement(this._gridPadding, 'jqplot-event-canvas'));
            var ectx = this.eventCanvas.setContext();
            ectx.fillStyle = 'rgba(0,0,0,0)';
            ectx.fillRect(0,0,ectx.canvas.width, ectx.canvas.height);
            
            // bind custom event handlers to regular events.
            this.bindCustomEvents();
            
            // draw legend before series if the series needs to know the legend dimensions.
            if (this.legend.preDraw) {  
                this.target.append(this.legend.draw());
                this.legend.pack(this._gridPadding);
                if (this.legend._elem) {
                    this.drawSeries(sctx, {legendInfo:{location:this.legend.location, width:this.legend.getWidth(), height:this.legend.getHeight(), xoffset:this.legend.xoffset, yoffset:this.legend.yoffset}});
                }
                else {
                    this.drawSeries(sctx);
                }
            }
            else {  // draw series before legend
                this.drawSeries(sctx);
                this.target.append(this.legend.draw());
                this.legend.pack(this._gridPadding);                
            }
            
            // register event listeners on the overlay canvas
            for (var i=0; i<$.jqplot.eventListenerHooks.length; i++) {
                var h = $.jqplot.eventListenerHooks[i];
                // in the handler, this will refer to the eventCanvas dom element.
                // make sure there are references back into plot objects.
                this.eventCanvas._elem.bind(h[0], {plot:this}, h[1]);
            }

            for (var i=0; i<$.jqplot.postDrawHooks.length; i++) {
                $.jqplot.postDrawHooks[i].call(this);
            }
            this.target.trigger('jqplotPostDraw', [this]);
        };
        
        this.bindCustomEvents = function() {
            this.eventCanvas._elem.bind('click', {plot:this}, this.onClick);
            this.eventCanvas._elem.bind('dblclick', {plot:this}, this.onDblClick);
            this.eventCanvas._elem.bind('mousedown', {plot:this}, this.onMouseDown);
            this.eventCanvas._elem.bind('mouseup', {plot:this}, this.onMouseUp);
            this.eventCanvas._elem.bind('mousemove', {plot:this}, this.onMouseMove);
            this.eventCanvas._elem.bind('mouseenter', {plot:this}, this.onMouseEnter);
            this.eventCanvas._elem.bind('mouseleave', {plot:this}, this.onMouseLeave);
        };
        
        function getEventPosition(ev) {
    	    var plot = ev.data.plot;
            // var xaxis = plot.axes.xaxis;
            // var x2axis = plot.axes.x2axis;
            // var yaxis = plot.axes.yaxis;
            // var y2axis = plot.axes.y2axis;
    	    var offsets = plot.eventCanvas._elem.offset();
    	    var gridPos = {x:ev.pageX - offsets.left, y:ev.pageY - offsets.top};
            // var dataPos = {x1y1:{x:null, y:null}, x1y2:{x:null, y:null}, x2y1:{x:null, y:null}, x2y2:{x:null, y:null}};
    	    var dataPos = {xaxis:null, yaxis:null, x2axis:null, y2axis:null, y3axis:null, y4axis:null, y5axis:null, y6axis:null, y7axis:null, y8axis:null, y9axis:null};
    	    
    	    var an = ['xaxis', 'yaxis', 'x2axis', 'y2axis', 'y3axis', 'y4axis', 'y5axis', 'y6axis', 'y7axis', 'y8axis', 'y9axis'];
    	    var ax = plot.axes;
    	    for (var n=11; n>0; n--) {
    	        var axis = an[n-1];
    	        if (ax[axis].show) {
    	            dataPos[axis] = ax[axis].series_p2u(gridPos[axis.charAt(0)]);
    	        }
    	    }

            return ({offsets:offsets, gridPos:gridPos, dataPos:dataPos});
        }
        
        function getNeighborPoint(plot, x, y) {
            var ret = null;
            var s, i, d0, d, j, r;
            var threshold;
            for (var i=0; i<plot.series.length; i++) {
                s = plot.series[i];
                r = s.renderer;
                if (s.show) {
                    threshold = Math.abs(s.markerRenderer.size/2+s.neighborThreshold);
                    for (var j=0; j<s.gridData.length; j++) {
                        p = s.gridData[j];
                        // neighbor looks different to OHLC chart.
                        if (r.constructor == $.jqplot.OHLCRenderer) {
                            if (r.candleStick) {
                                var yp = s._yaxis.series_u2p;
                                if (x >= p[0]-r.bodyWidth/2 && x <= p[0]+r.bodyWidth/2 && y >= yp(s.data[j][2]) && y <= yp(s.data[j][3])) {
                                    ret = {seriesIndex: i, pointIndex:j, gridData:p, data:s.data[j]};
                                }
                            }
                            // if an open hi low close chart
                            else if (!r.hlc){
                                var yp = s._yaxis.series_u2p;
                                if (x >= p[0]-r.tickLength && x <= p[0]+r.tickLength && y >= yp(s.data[j][2]) && y <= yp(s.data[j][3])) {
                                    ret = {seriesIndex: i, pointIndex:j, gridData:p, data:s.data[j]};
                                }
                            }
                            // a hi low close chart
                            else {
                                var yp = s._yaxis.series_u2p;
                                if (x >= p[0]-r.tickLength && x <= p[0]+r.tickLength && y >= yp(s.data[j][1]) && y <= yp(s.data[j][2])) {
                                    ret = {seriesIndex: i, pointIndex:j, gridData:p, data:s.data[j]};
                                }
                            }
                            
                        }
                        else {
                            d = Math.sqrt( (x-p[0]) * (x-p[0]) + (y-p[1]) * (y-p[1]) );
                            if (d <= threshold && (d <= d0 || d0 == null)) {
                               d0 = d;
                               ret = {seriesIndex: i, pointIndex:j, gridData:p, data:s.data[j]};
                            }
                        }
                    } 
                }
            }
            return ret;
        }
        
        this.onClick = function(ev) {
            // Event passed in is unnormalized and will have data attribute.
            // Event passed out in normalized and won't have data attribute.
            var positions = getEventPosition(ev);
            var p = ev.data.plot;
            var neighbor = getNeighborPoint(p, positions.gridPos.x, positions.gridPos.y);
    	    ev.data.plot.eventCanvas._elem.trigger('jqplotClick', [positions.gridPos, positions.dataPos, neighbor, p]);
        };
        
        this.onDblClick = function(ev) {
            // Event passed in is unnormalized and will have data attribute.
            // Event passed out in normalized and won't have data attribute.
            var positions = getEventPosition(ev);
            var p = ev.data.plot;
            var neighbor = getNeighborPoint(p, positions.gridPos.x, positions.gridPos.y);
    	    ev.data.plot.eventCanvas._elem.trigger('jqplotDblClick', [positions.gridPos, positions.dataPos, neighbor, p]);
        };
        
        this.onMouseDown = function(ev) {
            var positions = getEventPosition(ev);
            var p = ev.data.plot;
            var neighbor = getNeighborPoint(p, positions.gridPos.x, positions.gridPos.y);
    	    ev.data.plot.eventCanvas._elem.trigger('jqplotMouseDown', [positions.gridPos, positions.dataPos, neighbor, p]);
        };
        
        this.onMouseUp = function(ev) {
            var positions = getEventPosition(ev);
    	    ev.data.plot.eventCanvas._elem.trigger('jqplotMouseUp', [positions.gridPos, positions.dataPos, null, ev.data.plot]);
        };
        
        this.onMouseMove = function(ev) {
            var positions = getEventPosition(ev);
            var p = ev.data.plot;
            var neighbor = getNeighborPoint(p, positions.gridPos.x, positions.gridPos.y);
    	    ev.data.plot.eventCanvas._elem.trigger('jqplotMouseMove', [positions.gridPos, positions.dataPos, neighbor, p]);
        };
        
        this.onMouseEnter = function(ev) {
            var positions = getEventPosition(ev);
            var p = ev.data.plot;
    	    ev.data.plot.eventCanvas._elem.trigger('jqplotMouseEnter', [positions.gridPos, positions.dataPos, null, p]);
        };
        
        this.onMouseLeave = function(ev) {
            var positions = getEventPosition(ev);
            var p = ev.data.plot;
    	    ev.data.plot.eventCanvas._elem.trigger('jqplotMouseLeave', [positions.gridPos, positions.dataPos, null, p]);
        };
        
        this.drawSeries = function(sctx, options){
            // first clear the canvas, since we are redrawing all series.
            sctx.clearRect(0,0,sctx.canvas.width, sctx.canvas.height);
            // if call series drawShadow method first, in case all series shadows
            // should be drawn before any series.  This will ensure, like for 
            // stacked bar plots, that shadows don't overlap series.
            for (var i=0; i<this.series.length; i++) {
                // console.log('series %s data: %s', i, this.series[i].data);
                this.series[i].drawShadow(sctx, options);
            }
            for (var i=0; i<this.series.length; i++) {
                this.series[i].draw(sctx, options);
                // console.log('series %s data: %s', i, this.series[i].data);
            }
        };
    }
    
        
   ColorGenerator = function(colors) {
        var idx = 0;
        
        this.next = function () { 
            if (idx < colors.length) {
                return colors[idx++];
            }
            else {
                idx = 0;
                return colors[idx++];
            }
        };
        
        this.previous = function () { 
            if (idx > 0) {
                return colors[idx--];
            }
            else {
                idx = colors.length-1;
                return colors[idx];
            }
        };
        
        this.setColors = function(c) {
            colors = c;
        };
        
        this.reset = function() {
            idx = 0;
        };
    };

    // convert a hex color string to rgb string.
    // h - 3 or 6 character hex string, with or without leading #
    // a - optional alpha
    $.jqplot.hex2rgb = function(h, a) {
        h = h.replace('#', '');
        if (h.length == 3) {
            h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
        }
        var rgb;
        rgb = 'rgba('+parseInt(h.slice(0,2), 16)+', '+parseInt(h.slice(2,4), 16)+', '+parseInt(h.slice(4,6), 16);
        if (a) {
            rgb += ', '+a;
        }
        rgb += ')';
        return rgb;
    };
    
    // convert an rgb color spec to a hex spec.  ignore any alpha specification.
    $.jqplot.rgb2hex = function(s) {
        var pat = /rgba?\( *([0-9]{1,3}\.?[0-9]*%?) *, *([0-9]{1,3}\.?[0-9]*%?) *, *([0-9]{1,3}\.?[0-9]*%?) *(?:, *[0-9.]*)?\)/;
        var m = s.match(pat);
        var h = '#';
        for (i=1; i<4; i++) {
            var temp;
            if (m[i].search(/%/) != -1) {
                temp = parseInt(255*m[i]/100, 10).toString(16);
                if (temp.length == 1) {
                    temp = '0'+temp;
                }
            }
            else {
                temp = parseInt(m[i], 10).toString(16);
                if (temp.length == 1) {
                    temp = '0'+temp;
                }
            }
            h += temp;
        }
        return h;
    };
    
    // given a css color spec, return an rgb css color spec
    $.jqplot.normalize2rgb = function(s, a) {
        if (s.search(/^ *rgba?\(/) != -1) {
            return s; 
        }
        else if (s.search(/^ *#?[0-9a-fA-F]?[0-9a-fA-F]/) != -1) {
            return $.jqplot.hex2rgb(s, a);
        }
        else {
            throw 'invalid color spec';
        }
    };
    
    // extract the r, g, b, a color components out of a css color spec.
    $.jqplot.getColorComponents = function(s) {
        var rgb = $.jqplot.normalize2rgb(s);
        var pat = /rgba?\( *([0-9]{1,3}\.?[0-9]*%?) *, *([0-9]{1,3}\.?[0-9]*%?) *, *([0-9]{1,3}\.?[0-9]*%?) *,? *([0-9.]* *)?\)/;
        var m = rgb.match(pat);
        var ret = [];
        for (i=1; i<4; i++) {
            if (m[i].search(/%/) != -1) {
                ret[i-1] = parseInt(255*m[i]/100, 10);
            }
            else {
                ret[i-1] = parseInt(m[i], 10);
            }
        }
        ret[3] = parseFloat(m[4]) ? parseFloat(m[4]) : 1.0;
        return ret;
    };
        
	// Convienence function that won't hang IE.
	$.jqplot.log = function() {
	    if (window.console && $.jqplot.debug) {
	       if (arguments.length == 1) {
	           console.log (arguments[0]);
	        }
	       else {
	           console.log(arguments);
	        }
	    }
	};
	var log = $.jqplot.log;
	

    // class: $.jqplot.AxisLabelRenderer
    // Renderer to place labels on the axes.
    $.jqplot.AxisLabelRenderer = function(options) {
        // Group: Properties
        $.jqplot.ElemContainer.call(this);
        // name of the axis associated with this tick
        this.axis;
        // prop: show
        // wether or not to show the tick (mark and label).
        this.show = true;
        // prop: label
        // The text or html for the label.
        this.label = '';
        this._elem;
        // prop: escapeHTML
        // true to escape HTML entities in the label.
        this.escapeHTML = false;
        
        $.extend(true, this, options);
    };
    
    $.jqplot.AxisLabelRenderer.prototype = new $.jqplot.ElemContainer();
    $.jqplot.AxisLabelRenderer.prototype.constructor = $.jqplot.AxisLabelRenderer;
    
    $.jqplot.AxisLabelRenderer.prototype.init = function(options) {
        $.extend(true, this, options);
    };
    
    $.jqplot.AxisLabelRenderer.prototype.draw = function() {
        this._elem = $('<div style="position:absolute;" class="jqplot-'+this.axis+'-label"></div>');
        
        if (Number(this.label)) {
            this._elem.css('white-space', 'nowrap');
        }
        
        if (!this.escapeHTML) {
            this._elem.html(this.label);
        }
        else {
            this._elem.text(this.label);
        }
        
        return this._elem;
    };
    
    $.jqplot.AxisLabelRenderer.prototype.pack = function() {
    };

    // class: $.jqplot.AxisTickRenderer
    // A "tick" object showing the value of a tick/gridline on the plot.
    $.jqplot.AxisTickRenderer = function(options) {
        // Group: Properties
        $.jqplot.ElemContainer.call(this);
        // prop: mark
        // tick mark on the axis.  One of 'inside', 'outside', 'cross', '' or null.
        this.mark = 'outside';
        // name of the axis associated with this tick
        this.axis;
        // prop: showMark
        // wether or not to show the mark on the axis.
        this.showMark = true;
        // prop: showGridline
        // wether or not to draw the gridline on the grid at this tick.
        this.showGridline = true;
        // prop: isMinorTick
        // if this is a minor tick.
        this.isMinorTick = false;
        // prop: size
        // Length of the tick beyond the grid in pixels.
        // DEPRECATED: This has been superceeded by markSize
        this.size = 4;
        // prop:  markSize
        // Length of the tick marks in pixels.  For 'cross' style, length
        // will be stoked above and below axis, so total length will be twice this.
        this.markSize = 6;
        // prop: show
        // wether or not to show the tick (mark and label).
        this.show = true;
        // prop: showLabel
        // wether or not to show the label.
        this.showLabel = true;
        this.label = '';
        this.value = null;
        this._styles = {};
        // prop: formatter
        // A class of a formatter for the tick text.  sprintf by default.
        this.formatter = $.jqplot.DefaultTickFormatter;
        // prop: formatString
        // string passed to the formatter.
        this.formatString = '';
        // prop: fontFamily
        // css spec for the font-family css attribute.
        this.fontFamily;
        // prop: fontSize
        // css spec for the font-size css attribute.
        this.fontSize;
        // prop: textColor
        // css spec for the color attribute.
        this.textColor;
        this._elem;
        
        $.extend(true, this, options);
    };
    
    $.jqplot.AxisTickRenderer.prototype.init = function(options) {
        $.extend(true, this, options);
    };
    
    $.jqplot.AxisTickRenderer.prototype = new $.jqplot.ElemContainer();
    $.jqplot.AxisTickRenderer.prototype.constructor = $.jqplot.AxisTickRenderer;
    
    $.jqplot.AxisTickRenderer.prototype.setTick = function(value, axisName, isMinor) {
        this.value = value;
        this.axis = axisName;
        if (isMinor) {
        	this.isMinorTick = true;
        }
        return this;
    };
    
    $.jqplot.AxisTickRenderer.prototype.draw = function() {
        if (!this.label) {
        	this.label = this.formatter(this.formatString, this.value);
        }
        style ='style="position:absolute;';
        if (Number(this.label)) {
            style +='white-space:nowrap;';
        }
        style += '"';
        this._elem = $('<div '+style+' class="jqplot-'+this.axis+'-tick">'+this.label+'</div>');
        for (var s in this._styles) {
            this._elem.css(s, this._styles[s]);
        }
        if (this.fontFamily) {
        	this._elem.css('font-family', this.fontFamily);
        }
        if (this.fontSize) {
        	this._elem.css('font-size', this.fontSize);
        }
        if (this.textColor) {
        	this._elem.css('color', this.textColor);
        }
        return this._elem;
    };
        
    $.jqplot.DefaultTickFormatter = function (format, val) {
        if (typeof val == 'number') {
            if (!format) {
            	format = '%.1f';
            }
            return $.jqplot.sprintf(format, val);
        }
        else {
            return String(val);
        }
    };
    
    $.jqplot.AxisTickRenderer.prototype.pack = function() {
    };
     
    // Class: $.jqplot.CanvasGridRenderer
    // The default jqPlot grid renderer, creating a grid on a canvas element.
    // The renderer has no additional options beyond the <Grid> class.
    $.jqplot.CanvasGridRenderer = function(){
        this.shadowRenderer = new $.jqplot.ShadowRenderer();
    };
    
    // called with context of Grid object
    $.jqplot.CanvasGridRenderer.prototype.init = function(options) {
        this._ctx;
        $.extend(true, this, options);
        // set the shadow renderer options
        var sopts = {lineJoin:'miter', lineCap:'round', fill:false, isarc:false, angle:this.shadowAngle, offset:this.shadowOffset, alpha:this.shadowAlpha, depth:this.shadowDepth, lineWidth:this.shadowWidth, closePath:false};
        this.renderer.shadowRenderer.init(sopts);
    };
    
    // called with context of Grid.
    $.jqplot.CanvasGridRenderer.prototype.createElement = function() {
        var elem = document.createElement('canvas');
        var w = this._plotDimensions.width;
        var h = this._plotDimensions.height;
        elem.width = w;
        elem.height = h;
        this._elem = $(elem);
        this._elem.addClass('jqplot-grid-canvas');
        this._elem.css({ position: 'absolute', left: 0, top: 0 });
        if ($.browser.msie) {
            window.G_vmlCanvasManager.init_(document);
        }
        if ($.browser.msie) {
            elem = window.G_vmlCanvasManager.initElement(elem);
        }
        this._top = this._offsets.top;
        this._bottom = h - this._offsets.bottom;
        this._left = this._offsets.left;
        this._right = w - this._offsets.right;
        this._width = this._right - this._left;
        this._height = this._bottom - this._top;
        return this._elem;
    };
    
    $.jqplot.CanvasGridRenderer.prototype.draw = function() {
        this._ctx = this._elem.get(0).getContext("2d");
        var ctx = this._ctx;
        var axes = this._axes;
        // Add the grid onto the grid canvas.  This is the bottom most layer.
        ctx.save();
        ctx.fillStyle = this.background;
        ctx.fillRect(this._left, this._top, this._width, this._height);
        
        if (this.drawGridlines) {
            ctx.save();
            ctx.lineJoin = 'miter';
            ctx.lineCap = 'butt';
            ctx.lineWidth = this.gridLineWidth;
            ctx.strokeStyle = this.gridLineColor;
            var b, e;
            var ax = ['xaxis', 'yaxis', 'x2axis', 'y2axis'];
            for (var i=4; i>0; i--) {
                var name = ax[i-1];
                var axis = axes[name];
                var ticks = axis._ticks;
                if (axis.show) {
                    for (var j=ticks.length; j>0; j--) {
                        var t = ticks[j-1];
                        if (t.show) {
                            var pos = Math.round(axis.u2p(t.value)) + 0.5;
                            switch (name) {
                                case 'xaxis':
                                    // draw the grid line
                                    if (t.showGridline) {
                                        drawLine(pos, this._top, pos, this._bottom);
                                    }
                                    
                                    // draw the mark
                                    if (t.showMark && t.mark) {
                                        s = t.markSize;
                                        m = t.mark;
                                        var pos = Math.round(axis.u2p(t.value)) + 0.5;
                                        switch (m) {
                                            case 'outside':
                                                b = this._bottom;
                                                e = this._bottom+s;
                                                break;
                                            case 'inside':
                                                b = this._bottom-s;
                                                e = this._bottom;
                                                break;
                                            case 'cross':
                                                b = this._bottom-s;
                                                e = this._bottom+s;
                                                break;
                                            default:
                                                b = this._bottom;
                                                e = this._bottom+s;
                                                break;
                                        }
                                        // draw the shadow
                                        if (this.shadow) {
                                            this.renderer.shadowRenderer.draw(ctx, [[pos,b],[pos,e]], {lineCap:'butt', lineWidth:this.gridLineWidth, offset:this.gridLineWidth*0.75, depth:2, fill:false, closePath:false});
                                        }
                                        // draw the line
                                        drawLine(pos, b, pos, e);
                                    }
                                    break;
                                case 'yaxis':
                                    // draw the grid line
                                    if (t.showGridline) {
                                        drawLine(this._right, pos, this._left, pos);
                                    }
                                    // draw the mark
                                    if (t.showMark && t.mark) {
                                        s = t.markSize;
                                        m = t.mark;
                                        var pos = Math.round(axis.u2p(t.value)) + 0.5;
                                        switch (m) {
                                            case 'outside':
                                                b = this._left-s;
                                                e = this._left;
                                                break;
                                            case 'inside':
                                                b = this._left;
                                                e = this._left+s;
                                                break;
                                            case 'cross':
                                                b = this._left-s;
                                                e = this._left+s;
                                                break;
                                            default:
                                                b = this._left-s;
                                                e = this._left;
                                                break;
                                                }
                                        // draw the shadow
                                        if (this.shadow) {
                                            this.renderer.shadowRenderer.draw(ctx, [[b, pos], [e, pos]], {lineCap:'butt', lineWidth:this.gridLineWidth*1.5, offset:this.gridLineWidth*0.75, fill:false, closePath:false});
                                        }
                                        drawLine(b, pos, e, pos, {strokeStyle:axis.borderColor});
                                    }
                                    break;
                                case 'x2axis':
                                    // draw the grid line
                                    if (t.showGridline) {
                                        drawLine(pos, this._bottom, pos, this._top);
                                    }
                                    // draw the mark
                                    if (t.showMark && t.mark) {
                                        s = t.markSize;
                                        m = t.mark;
                                        var pos = Math.round(axis.u2p(t.value)) + 0.5;
                                        switch (m) {
                                            case 'outside':
                                                b = this._top-s;
                                                e = this._top;
                                                break;
                                            case 'inside':
                                                b = this._top;
                                                e = this._top+s;
                                                break;
                                            case 'cross':
                                                b = this._top-s;
                                                e = this._top+s;
                                                break;
                                            default:
                                                b = this._top-s;
                                                e = this._top;
                                                break;
                                                }
                                        // draw the shadow
                                        if (this.shadow) {
                                            this.renderer.shadowRenderer.draw(ctx, [[pos,b],[pos,e]], {lineCap:'butt', lineWidth:this.gridLineWidth, offset:this.gridLineWidth*0.75, depth:2, fill:false, closePath:false});
                                        }
                                        drawLine(pos, b, pos, e);
                                    }
                                    break;
                                case 'y2axis':
                                    // draw the grid line
                                    if (t.showGridline) {
                                        drawLine(this._left, pos, this._right, pos);
                                    }
                                    // draw the mark
                                    if (t.showMark && t.mark) {
                                        s = t.markSize;
                                        m = t.mark;
                                        var pos = Math.round(axis.u2p(t.value)) + 0.5;
                                        switch (m) {
                                            case 'outside':
                                                b = this._right;
                                                e = this._right+s;
                                                break;
                                            case 'inside':
                                                b = this._right-s;
                                                e = this._right;
                                                break;
                                            case 'cross':
                                                b = this._right-s;
                                                e = this._right+s;
                                                break;
                                            default:
                                                b = this._right;
                                                e = this._right+s;
                                                break;
                                                }
                                        // draw the shadow
                                        if (this.shadow) {
                                            this.renderer.shadowRenderer.draw(ctx, [[b, pos], [e, pos]], {lineCap:'butt', lineWidth:this.gridLineWidth*1.5, offset:this.gridLineWidth*0.75, fill:false, closePath:false});
                                        }
                                        drawLine(b, pos, e, pos, {strokeStyle:axis.borderColor});
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }
            }
            // Now draw grid lines for additional y axes
            ax = ['y3axis', 'y4axis', 'y5axis', 'y6axis', 'y7axis', 'y8axis', 'y9axis'];
            for (var i=7; i>0; i--) {
                var axis = axes[ax[i-1]];
                var ticks = axis._ticks;
                if (axis.show) {
                    var tn = ticks[axis.numberTicks-1];
                    var t0 = ticks[0];
                    var left = axis.getLeft();
                    var points = [[left, tn.getTop() + tn.getHeight()/2], [left, t0.getTop() + t0.getHeight()/2 + 1.0]];
                    // draw the shadow
                    if (this.shadow) {
                        this.renderer.shadowRenderer.draw(ctx, points, {lineCap:'butt', fill:false, closePath:false});
                    }
                    // draw the line
                    drawLine(points[0][0], points[0][1], points[1][0], points[1][1], {lineCap:'butt', strokeStyle:axis.borderColor, lineWidth:axis.borderWidth});
                    // draw the tick marks
                    for (var j=ticks.length; j>0; j--) {
                        var t = ticks[j-1];
                        s = t.markSize;
                        m = t.mark;
                        var pos = Math.round(axis.u2p(t.value)) + 0.5;
                        if (t.show && t.showGridline) {
                            switch (m) {
                                case 'outside':
                                    b = left;
                                    e = left+s;
                                    break;
                                case 'inside':
                                    b = left-s;
                                    e = left;
                                    break;
                                case 'cross':
                                    b = left-s;
                                    e = left+s;
                                    break;
                                default:
                                    b = left;
                                    e = left+s;
                                    break;
                            }
                            points = [[b,pos], [e,pos]];
                            // draw the shadow
                            if (this.shadow) {
                                this.renderer.shadowRenderer.draw(ctx, points, {lineCap:'butt', lineWidth:this.gridLineWidth*1.5, offset:this.gridLineWidth*0.75, fill:false, closePath:false});
                            }
                            // draw the line
                            drawLine(b, pos, e, pos, {strokeStyle:axis.borderColor});
                        }
                    }
                }
            }
            
            ctx.restore();
        }
        
        function drawLine(bx, by, ex, ey, opts) {
            ctx.save();
            opts = opts || {};
            $.extend(true, ctx, opts);
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(ex, ey);
            ctx.stroke();
            ctx.restore();
        }
        
        if (this.shadow) {
            var points = [[this._left, this._bottom], [this._right, this._bottom], [this._right, this._top]];
            this.renderer.shadowRenderer.draw(ctx, points);
        }
        // Now draw border around grid.  Use axis border definitions. start at
        // upper left and go clockwise.
        drawLine (this._left, this._top, this._right, this._top, {lineCap:'round', strokeStyle:axes.x2axis.borderColor, lineWidth:axes.x2axis.borderWidth});
        drawLine (this._right, this._top, this._right, this._bottom, {lineCap:'round', strokeStyle:axes.y2axis.borderColor, lineWidth:axes.y2axis.borderWidth});
        drawLine (this._right, this._bottom, this._left, this._bottom, {lineCap:'round', strokeStyle:axes.xaxis.borderColor, lineWidth:axes.xaxis.borderWidth});
        drawLine (this._left, this._bottom, this._left, this._top, {lineCap:'round', strokeStyle:axes.yaxis.borderColor, lineWidth:axes.yaxis.borderWidth});
        // ctx.lineWidth = this.borderWidth;
        // ctx.strokeStyle = this.borderColor;
        // ctx.strokeRect(this._left, this._top, this._width, this._height);
        
    
        ctx.restore();
    };
 
    // Class: $.jqplot.DivTitleRenderer
    // The default title renderer for jqPlot.  This class has no options beyond the <Title> class. 
    $.jqplot.DivTitleRenderer = function() {
    };
    
    $.jqplot.DivTitleRenderer.prototype.init = function(options) {
        $.extend(true, this, options);
    };
    
    $.jqplot.DivTitleRenderer.prototype.draw = function() {
        var r = this.renderer;
        if (!this.text) {
            this.show = false;
            this._elem = $('<div style="height:0px;width:0px;"></div>');
        }
        else if (this.text) {
            // don't trust that a stylesheet is present, set the position.
            var styletext = 'position:absolute;top:0px;left:0px;';
            styletext += (this._plotWidth) ? 'width:'+this._plotWidth+'px;' : '';
            styletext += (this.fontFamily) ? 'font-family:'+this.fontFamily+';' : '';
            styletext += (this.fontSize) ? 'font-size:'+this.fontSize+';' : '';
            styletext += (this.textAlign) ? 'text-align:'+this.textAlign+';' : 'text-align:center;';
            styletext += (this.textColor) ? 'color:'+this.textColor+';' : '';
            this._elem = $('<div class="jqplot-title" style="'+styletext+'">'+this.text+'</div>');
        }
        
        return this._elem;
    };
    
    $.jqplot.DivTitleRenderer.prototype.pack = function() {
        // nothing to do here
    };
  
    // Class: $.jqplot.LineRenderer
    // The default line renderer for jqPlot, this class has no options beyond the <Series> class.
    // Draws series as a line.
    $.jqplot.LineRenderer = function(){
        this.shapeRenderer = new $.jqplot.ShapeRenderer();
        this.shadowRenderer = new $.jqplot.ShadowRenderer();
    };
    
    // called with scope of series.
    $.jqplot.LineRenderer.prototype.init = function(options) {
        $.extend(true, this.renderer, options);
        // set the shape renderer options
        var opts = {lineJoin:'round', lineCap:'round', fill:this.fill, isarc:false, strokeStyle:this.color, fillStyle:this.fillColor, lineWidth:this.lineWidth, closePath:this.fill};
        this.renderer.shapeRenderer.init(opts);
        // set the shadow renderer options
        // scale the shadowOffset to the width of the line.
        if (this.lineWidth > 2.5) {
            var shadow_offset = this.shadowOffset* (1 + (Math.atan((this.lineWidth/2.5))/0.785398163 - 1)*0.6);
            // var shadow_offset = this.shadowOffset;
        }
        // for skinny lines, don't make such a big shadow.
        else {
            var shadow_offset = this.shadowOffset*Math.atan((this.lineWidth/2.5))/0.785398163;
        }
        var sopts = {lineJoin:'round', lineCap:'round', fill:this.fill, isarc:false, angle:this.shadowAngle, offset:shadow_offset, alpha:this.shadowAlpha, depth:this.shadowDepth, lineWidth:this.lineWidth, closePath:this.fill};
        this.renderer.shadowRenderer.init(sopts);
    };
    
    // Method: setGridData
    // converts the user data values to grid coordinates and stores them
    // in the gridData array.
    // Called with scope of a series.
    $.jqplot.LineRenderer.prototype.setGridData = function() {
        // recalculate the grid data
        var xp = this._xaxis.series_u2p;
        var yp = this._yaxis.series_u2p;
        var data = this._plotData;
        var pdata = this._prevPlotData;
        this.gridData = [];
        this._prevGridData = [];
        for (var i=0; i<this.data.length; i++) {
            if (data[i] != null) {
                this.gridData.push([xp.call(this._xaxis, data[i][0]), yp.call(this._yaxis, data[i][1])]);
            }
            if (pdata[i] != null) {
                this._prevGridData.push([xp.call(this._xaxis, pdata[i][0]), yp.call(this._yaxis, pdata[i][1])]);
            }
        }
    };
    
    // Method: makeGridData
    // converts any arbitrary data values to grid coordinates and
    // returns them.  This method exists so that plugins can use a series'
    // linerenderer to generate grid data points without overwriting the
    // grid data associated with that series.
    // Called with scope of a series.
    $.jqplot.LineRenderer.prototype.makeGridData = function(data) {
        // recalculate the grid data
        var xp = this._xaxis.series_u2p;
        var yp = this._yaxis.series_u2p;
        var gd = [];
        var pgd = [];
        for (var i=0; i<data.length; i++) {
            if (data[i] != null) {
                gd.push([xp.call(this._xaxis, data[i][0]), yp.call(this._yaxis, data[i][1])]);
            }
        }
        return gd;
    };
    

    // called within scope of series.
    $.jqplot.LineRenderer.prototype.draw = function(ctx, gd, options) {
        var i;
        var opts = (options != undefined) ? options : {};
        var shadow = (opts.shadow != undefined) ? opts.shadow : this.shadow;
        var showLine = (opts.showLine != undefined) ? opts.showLine : this.showLine;
        var fill = (opts.fill != undefined) ? opts.fill : this.fill;
        var fillAndStroke = (opts.fillAndStroke != undefined) ? opts.fillAndStroke : this.fillAndStroke;
        ctx.save();
        if (gd.length) {
            if (showLine) {
                // if we fill, we'll have to add points to close the curve.
                if (fill) {
                    // is stoking line as well as filling, get a copy of line data.
                    if (fillAndStroke) {
                        var fasgd = gd.slice(0);
                    }
                    // if not stacked, fill down to axis
                    if (this.index == 0 || !this._stack) {
                        var gridymin = this._yaxis.series_u2p(this._yaxis.min) - this.gridBorderWidth / 2;
                        // IE doesn't return new length on unshift
                        gd.unshift([gd[0][0], gridymin]);
                        len = gd.length;
                        gd.push([gd[len - 1][0], gridymin]);                    
                    }
                    // if stacked, fill to line below 
                    else {
                        var prev = this._prevGridData;
                        for (var i=prev.length; i>0; i--) {
                            gd.push(prev[i-1]);
                        }
                    }
                }
                if (shadow) {
                    this.renderer.shadowRenderer.draw(ctx, gd, opts);
                }
            
                this.renderer.shapeRenderer.draw(ctx, gd, opts); 
                if (fillAndStroke) {
                    var fasopts = $.extend(true, {}, opts, {fill:false, closePath:false});
                    this.renderer.shapeRenderer.draw(ctx, fasgd, fasopts);
                    //////////
                    // TODO: figure out some way to do shadows nicely
                    // if (shadow) {
                    //     this.renderer.shadowRenderer.draw(ctx, fasgd, fasopts);
                    // }
                    // now draw the markers
                    if (this.markerRenderer.show) {
                        for (i=0; i<fasgd.length; i++) {
                            this.markerRenderer.draw(fasgd[i][0], fasgd[i][1], ctx, opts.markerOptions);
                        }
                    }
                }
            }
        
            // now draw the markers
            if (this.markerRenderer.show && !fill) {
                for (i=0; i<gd.length; i++) {
                    this.markerRenderer.draw(gd[i][0], gd[i][1], ctx, opts.markerOptions);
                }
            }
        }
        
        ctx.restore();
    };  
    
    $.jqplot.LineRenderer.prototype.drawShadow = function(ctx, gd, options) {
        // This is a no-op, shadows drawn with lines.
    };
    
    
    // class: $.jqplot.LinearAxisRenderer
    // The default jqPlot axis renderer, creating a numeric axis.
    // The renderer has no additional options beyond the <Axis> object.
    $.jqplot.LinearAxisRenderer = function() {
    };
    
    // called with scope of axis object.
    $.jqplot.LinearAxisRenderer.prototype.init = function(options){
        $.extend(true, this, options);
        var db = this._dataBounds;
        // Go through all the series attached to this axis and find
        // the min/max bounds for this axis.
        for (var i=0; i<this._series.length; i++) {
            var s = this._series[i];
            var d = s._plotData;
            
            for (var j=0; j<d.length; j++) { 
                if (this.name == 'xaxis' || this.name == 'x2axis') {
                    if (d[j][0] < db.min || db.min == null) {
                    	db.min = d[j][0];
                    }
                    if (d[j][0] > db.max || db.max == null) {
                    	db.max = d[j][0];
                    }
                }              
                else {
                    if (d[j][1] < db.min || db.min == null) {
                    	db.min = d[j][1];
                    }
                    if (d[j][1] > db.max || db.max == null) {
                    	db.max = d[j][1];
                    }
                }              
            }
        }
    };
    
    // called with scope of axis
    $.jqplot.LinearAxisRenderer.prototype.draw = function(ctx) {
        if (this.show) {
            // populate the axis label and value properties.
            // createTicks is a method on the renderer, but
            // call it within the scope of the axis.
            this.renderer.createTicks.call(this);
            // fill a div with axes labels in the right direction.
            // Need to pregenerate each axis to get it's bounds and
            // position it and the labels correctly on the plot.
            var dim=0;
            var temp;
            
            this._elem = $('<div class="jqplot-axis jqplot-'+this.name+'" style="position:absolute;"></div>');
            
            if (this.name == 'xaxis' || this.name == 'x2axis') {
            	this._elem.width(this._plotDimensions.width);
            }
            else {
                this._elem.height(this._plotDimensions.height);
            }
            
            // create a _label object.
            this.labelOptions.axis = this.name;
            this._label = new this.labelRenderer(this.labelOptions);
            if (this._label.show) {
                var elem = this._label.draw(ctx);
                elem.appendTo(this._elem);
            }
    
            if (this.showTicks) {
                var t = this._ticks;
                for (var i=0; i<t.length; i++) {
                    var tick = t[i];
                    if (tick.showLabel && (!tick.isMinorTick || this.showMinorTicks)) {
                        var elem = tick.draw(ctx);
                        elem.appendTo(this._elem);
                    }
                }
            }
        }
        return this._elem;
    };
    
    // called with scope of axis
    $.jqplot.LinearAxisRenderer.prototype.set = function() { 
        var dim = 0;
        var temp;
        var w = 0;
        var h = 0;
        var lshow = (this._label == null) ? false : this._label.show;
        if (this.show && this.showTicks) {
            var t = this._ticks;
            for (var i=0; i<t.length; i++) {
                var tick = t[i];
                if (tick.showLabel && (!tick.isMinorTick || this.showMinorTicks)) {
                    if (this.name == 'xaxis' || this.name == 'x2axis') {
                        temp = tick._elem.outerHeight(true);
                    }
                    else {
                        temp = tick._elem.outerWidth(true);
                    }
                    if (temp > dim) {
                    	dim = temp;
                    }
                }
            }
            
            if (lshow) {
                w = this._label._elem.outerWidth(true);
                h = this._label._elem.outerHeight(true); 
            }
            if (this.name == 'xaxis') {
                dim = dim + h;
            	this._elem.css({'height':dim+'px', left:'0px', bottom:'0px'});
            }
            else if (this.name == 'x2axis') {
                dim = dim + h;
            	this._elem.css({'height':dim+'px', left:'0px', top:'0px'});
            }
            else if (this.name == 'yaxis') {
                dim = dim + w;
            	this._elem.css({'width':dim+'px', left:'0px', top:'0px'});
            	if (lshow && this._label.constructor == $.jqplot.AxisLabelRenderer) {
                    this._label._elem.css('width', w+'px');
                }
            }
            else {
                dim = dim + w;
            	this._elem.css({'width':dim+'px', right:'0px', top:'0px'});
            	if (lshow && this._label.constructor == $.jqplot.AxisLabelRenderer) {
                    this._label._elem.css('width', w+'px');
                }
            }
        }  
    };    
    
    // called with scope of axis
    $.jqplot.LinearAxisRenderer.prototype.createTicks = function() {
        // we're are operating on an axis here
        var ticks = this._ticks;
        var userTicks = this.ticks;
        var name = this.name;
        // databounds were set on axis initialization.
        var db = this._dataBounds;
        var dim, interval;
        var min, max;
        var pos1, pos2;
        var tt, i;
        
        // if we already have ticks, use them.
        // ticks must be in order of increasing value.
        
        if (userTicks.length) {
            // ticks could be 1D or 2D array of [val, val, ,,,] or [[val, label], [val, label], ...] or mixed
            for (i=0; i<userTicks.length; i++){
                var ut = userTicks[i];
                var t = new this.tickRenderer(this.tickOptions);
                if (ut.constructor == Array) {
                    t.value = ut[0];
                    t.label = ut[1];
                    if (!this.showTicks) {
                        t.showLabel = false;
                        t.showMark = false;
                    }
                    else if (!this.showTickMarks) {
                    	t.showMark = false;
                    }
                    t.setTick(ut[0], this.name);
                    this._ticks.push(t);
                }
                
                else {
                    t.value = ut;
                    if (!this.showTicks) {
                        t.showLabel = false;
                        t.showMark = false;
                    }
                    else if (!this.showTickMarks) {
                    	t.showMark = false;
                    }
                    t.setTick(ut, this.name);
                    this._ticks.push(t);
                }
            }
            this.numberTicks = userTicks.length;
            this.min = this._ticks[0].value;
            this.max = this._ticks[this.numberTicks-1].value;
            this.tickInterval = (this.max - this.min) / (this.numberTicks - 1);
        }
        
        // we don't have any ticks yet, let's make some!
        else {
            if (name == 'xaxis' || name == 'x2axis') {
                dim = this._plotDimensions.width;
            }
            else {
                dim = this._plotDimensions.height;
            }
            
            // if min, max and number of ticks specified, user can't specify interval.
            if (!this.autoscale && this.min != null && this.max != null && this.numberTicks != null) {
                this.tickInterval = null;
            }
            
            // if max, min, and interval specified and interval won't fit, ignore interval.
            // if (this.min != null && this.max != null && this.tickInterval != null) {
            //     if (parseInt((this.max-this.min)/this.tickInterval, 10) != (this.max-this.min)/this.tickInterval) {
            //         this.tickInterval = null;
            //     }
            // }
        
            min = ((this.min != null) ? this.min : db.min);
            max = ((this.max != null) ? this.max : db.max);
            
            // if min and max are same, space them out a bit
            if (min == max) {
                var adj = 0.05;
                if (min > 0) {
                    adj = Math.max(Math.log(min)/Math.LN10, 0.05);
                }
                min -= adj;
                max += adj;
            }

            var range = max - min;
            var rmin, rmax;
            var temp;
            
            // autoscale.  Can't autoscale if min or max is supplied.
            // Will use numberTicks and tickInterval if supplied.
            if (this.autoscale && this.min == null && this.max == null) {
                var rrange, ti, margin;
    
                if (this.numberTicks == null){
                    if (dim > 100) {
                        this.numberTicks = parseInt(3+(dim-100)/75, 10);
                    }
                    else {
                        this.numberTicks = 2;
                    }
                }
                
                if (this.tickInterval == null) {
                    // get a tick interval
                    ti = range/(this.numberTicks - 1);
                
                    if (ti < 1) {
                        temp = Math.pow(10, Math.abs(Math.floor(Math.log(ti)/Math.LN10)));
                    }
                    else {
                        temp = 1;
                    }
                    this.tickInterval = Math.ceil(ti*temp*this.pad)/temp;
                }
                
                // try to compute a nicer, more even tick interval
                // temp = Math.pow(10, Math.floor(Math.log(ti)/Math.LN10));
                // this.tickInterval = Math.ceil(ti/temp) * temp;
                rrange = this.tickInterval * (this.numberTicks - 1);
                margin = (rrange - range)/2;
                
                if (this.min == null) {
                    this.min = Math.floor(temp*(min-margin))/temp;
                }
                if (this.max == null) {
                    this.max = this.min + rrange;
                }
            }
            
            else {
                rmin = (this.min != null) ? this.min : min - range*(this.padMin - 1);
                rmax = (this.max != null) ? this.max : max + range*(this.padMax - 1);
                this.min = rmin;
                this.max = rmax;
                range = this.max - this.min;
    
                if (this.numberTicks == null){
                    // if tickInterval is specified by user, we will ignore computed maximum.
                    // max will be equal or greater to fit even # of ticks.
                    if (this.tickInterval != null) {
                        this.numberTicks = Math.ceil((this.max - this.min)/this.tickInterval)+1;
                        this.max = this.min + this.tickInterval*(this.numberTicks-1);
                    }
                    else if (dim > 100) {
                        this.numberTicks = parseInt(3+(dim-100)/75, 10);
                    }
                    else {
                        this.numberTicks = 2;
                    }
                }
            
                if (this.tickInterval == null) {
                	this.tickInterval = range / (this.numberTicks-1);
                }
            }

            for (var i=0; i<this.numberTicks; i++){
                tt = this.min + i * this.tickInterval;
                var t = new this.tickRenderer(this.tickOptions);
                // var t = new $.jqplot.AxisTickRenderer(this.tickOptions);
                if (!this.showTicks) {
                    t.showLabel = false;
                    t.showMark = false;
                }
                else if (!this.showTickMarks) {
                	t.showMark = false;
                }
                t.setTick(tt, this.name);
                this._ticks.push(t);
            }
        }
    };
    
    // called with scope of axis
    $.jqplot.LinearAxisRenderer.prototype.pack = function(pos, offsets) {
        var ticks = this._ticks;
        var max = this.max;
        var min = this.min;
        var offmax = offsets.max;
        var offmin = offsets.min;
        var lshow = (this._label == null) ? false : this._label.show;
        
        for (var p in pos) {
            this._elem.css(p, pos[p]);
        }
        
        this._offsets = offsets;
        // pixellength will be + for x axes and - for y axes becasue pixels always measured from top left.
        var pixellength = offmax - offmin;
        var unitlength = max - min;
        
        // point to unit and unit to point conversions references to Plot DOM element top left corner.
        this.p2u = function(p){
            return (p - offmin) * unitlength / pixellength + min;
        };
        
        this.u2p = function(u){
            return (u - min) * pixellength / unitlength + offmin;
        };
                
        if (this.name == 'xaxis' || this.name == 'x2axis'){
            this.series_u2p = function(u){
                return (u - min) * pixellength / unitlength;
            };
            this.series_p2u = function(p){
                return p * unitlength / pixellength + min;
            };
        }
        
        else {
            this.series_u2p = function(u){
                return (u - max) * pixellength / unitlength;
            };
            this.series_p2u = function(p){
                return p * unitlength / pixellength + max;
            };
        }
        
        if (this.show) {
            if (this.name == 'xaxis' || this.name == 'x2axis') {
                for (i=0; i<ticks.length; i++) {
                    var t = ticks[i];
                    if (t.show && t.showLabel) {
                        var shim;
                        
                        if (t.constructor == $.jqplot.CanvasAxisTickRenderer && t.angle) {
                            // will need to adjust auto positioning based on which axis this is.
                            var temp = (this.name == 'xaxis') ? 1 : -1;
                            switch (t.labelPosition) {
                                case 'auto':
                                    // position at end
                                    if (temp * t.angle < 0) {
                                        shim = -t.getWidth() + t._textRenderer.height * Math.sin(-t._textRenderer.angle) / 2;
                                    }
                                    // position at start
                                    else {
                                        shim = -t._textRenderer.height * Math.sin(t._textRenderer.angle) / 2;
                                    }
                                    break;
                                case 'end':
                                    shim = -t.getWidth() + t._textRenderer.height * Math.sin(-t._textRenderer.angle) / 2;
                                    break;
                                case 'start':
                                    shim = -t._textRenderer.height * Math.sin(t._textRenderer.angle) / 2;
                                    break;
                                case 'middle':
                                    shim = -t.getWidth()/2 + t._textRenderer.height * Math.sin(-t._textRenderer.angle) / 2;
                                    break;
                                default:
                                    shim = -t.getWidth()/2 + t._textRenderer.height * Math.sin(-t._textRenderer.angle) / 2;
                                    break;
                            }
                        }
                        else {
                            shim = -t.getWidth()/2;
                        }
                        var val = this.u2p(t.value) + shim + 'px';
                        t._elem.css('left', val);
                        t.pack();
                    }
                }
                if (lshow) {
                    var w = this._label._elem.outerWidth(true);
                    this._label._elem.css('left', offmin + pixellength/2 - w/2 + 'px');
                    if (this.name == 'xaxis') {
                        this._label._elem.css('bottom', '0px');
                    }
                    else {
                        this._label._elem.css('top', '0px');
                    }
                    this._label.pack();
                }
            }
            else {
                for (i=0; i<ticks.length; i++) {
                    var t = ticks[i];
                    if (t.show && t.showLabel) {                        
                        var shim;
                        if (t.constructor == $.jqplot.CanvasAxisTickRenderer && t.angle) {
                            // will need to adjust auto positioning based on which axis this is.
                            var temp = (this.name == 'yaxis') ? 1 : -1;
                            switch (t.labelPosition) {
                                case 'auto':
                                    // position at end
                                case 'end':
                                    if (temp * t.angle < 0) {
                                        shim = -t._textRenderer.height * Math.cos(-t._textRenderer.angle) / 2;
                                    }
                                    else {
                                        shim = -t.getHeight() + t._textRenderer.height * Math.cos(t._textRenderer.angle) / 2;
                                    }
                                    break;
                                case 'start':
                                    if (t.angle > 0) {
                                        shim = -t._textRenderer.height * Math.cos(-t._textRenderer.angle) / 2;
                                    }
                                    else {
                                        shim = -t.getHeight() + t._textRenderer.height * Math.cos(t._textRenderer.angle) / 2;
                                    }
                                    break;
                                case 'middle':
                                    // if (t.angle > 0) {
                                    //     shim = -t.getHeight()/2 + t._textRenderer.height * Math.sin(-t._textRenderer.angle) / 2;
                                    // }
                                    // else {
                                    //     shim = -t.getHeight()/2 - t._textRenderer.height * Math.sin(t._textRenderer.angle) / 2;
                                    // }
                                    shim = -t.getHeight()/2;
                                    break;
                                default:
                                    shim = -t.getHeight()/2;
                                    break;
                            }
                        }
                        else {
                            shim = -t.getHeight()/2;
                        }
                        
                        var val = this.u2p(t.value) + shim + 'px';
                        t._elem.css('top', val);
                        t.pack();
                    }
                }
                if (lshow) {
                    var h = this._label._elem.outerHeight(true);
                    this._label._elem.css('top', offmax - pixellength/2 - h/2 + 'px');
                    if (this.name == 'yaxis') {
                        this._label._elem.css('left', '0px');
                    }
                    else {
                        this._label._elem.css('right', '0px');
                    }   
                    this._label.pack();
                }
            }
        }
    };


	// class: $.jqplot.MarkerRenderer
	// The default jqPlot marker renderer, rendering the points on the line.
    $.jqplot.MarkerRenderer = function(options){
        // Group: Properties
        
        // prop: show
        // wether or not to show the marker.
        this.show = true;
        // prop: style
        // One of diamond, circle, square, x, plus, dash, filledDiamond, filledCircle, filledSquare
        this.style = 'filledCircle';
        // prop: lineWidth
        // size of the line for non-filled markers.
        this.lineWidth = 2;
        // prop: size
        // Size of the marker (diameter or circle, length of edge of square, etc.)
        this.size = 9.0;
        // prop: color
        // color of marker.  Will be set to color of series by default on init.
        this.color = '#666666';
        // prop: shadow
        // wether or not to draw a shadow on the line
        this.shadow = true;
        // prop: shadowAngle
        // Shadow angle in degrees
        this.shadowAngle = 45;
        // prop: shadowOffset
        // Shadow offset from line in pixels
        this.shadowOffset = 1;
        // prop: shadowDepth
        // Number of times shadow is stroked, each stroke offset shadowOffset from the last.
        this.shadowDepth = 3;
        // prop: shadowAlpha
        // Alpha channel transparency of shadow.  0 = transparent.
        this.shadowAlpha = '0.07';
        // prop: shadowRenderer
        // Renderer that will draws the shadows on the marker.
        this.shadowRenderer = new $.jqplot.ShadowRenderer();
        // prop: shapeRenderer
        // Renderer that will draw the marker.
        this.shapeRenderer = new $.jqplot.ShapeRenderer();
        
        $.extend(true, this, options);
    };
    
    $.jqplot.MarkerRenderer.prototype.init = function(options) {
        $.extend(true, this, options);
        var sdopt = {angle:this.shadowAngle, offset:this.shadowOffset, alpha:this.shadowAlpha, lineWidth:this.lineWidth, depth:this.shadowDepth, closePath:true};
        if (this.style.indexOf('filled') != -1) {
            sdopt.fill = true;
        }
        if (this.style.indexOf('ircle') != -1) {
            sdopt.isarc = true;
            sdopt.closePath = false;
        }
        this.shadowRenderer.init(sdopt);
        
        var shopt = {fill:false, isarc:false, strokeStyle:this.color, fillStyle:this.color, lineWidth:this.lineWidth, closePath:true};
        if (this.style.indexOf('filled') != -1) {
            shopt.fill = true;
        }
        if (this.style.indexOf('ircle') != -1) {
            shopt.isarc = true;
            shopt.closePath = false;
        }
        this.shapeRenderer.init(shopt);
    };
    
    $.jqplot.MarkerRenderer.prototype.drawDiamond = function(x, y, ctx, fill, options) {
        var stretch = 1.2;
        var dx = this.size/2/stretch;
        var dy = this.size/2*stretch;
        var points = [[x-dx, y], [x, y+dy], [x+dx, y], [x, y-dy]];
        if (this.shadow) {
            this.shadowRenderer.draw(ctx, points);
        }
        this.shapeRenderer.draw(ctx, points, options);

        ctx.restore();
    };
    
    $.jqplot.MarkerRenderer.prototype.drawSquare = function(x, y, ctx, fill, options) {
        var stretch = 1.0;
        var dx = this.size/2/stretch;
        var dy = this.size/2*stretch;
        var points = [[x-dx, y-dy], [x-dx, y+dy], [x+dx, y+dy], [x+dx, y-dy]];
        if (this.shadow) {
            this.shadowRenderer.draw(ctx, points);
        }
        this.shapeRenderer.draw(ctx, points, options);

        ctx.restore();
    };
    
    $.jqplot.MarkerRenderer.prototype.drawCircle = function(x, y, ctx, fill, options) {
        var radius = this.size/2;
        var end = 2*Math.PI;
        var points = [x, y, radius, 0, end, true];
        if (this.shadow) {
            this.shadowRenderer.draw(ctx, points);
        }
        this.shapeRenderer.draw(ctx, points, options);
        
        ctx.restore();
    };
    
    $.jqplot.MarkerRenderer.prototype.draw = function(x, y, ctx, options) {
        options = options || {};
        switch (this.style) {
            case 'diamond':
                this.drawDiamond(x,y,ctx, false, options);
                break;
            case 'filledDiamond':
                this.drawDiamond(x,y,ctx, true, options);
                break;
            case 'circle':
                this.drawCircle(x,y,ctx, false, options);
                break;
            case 'filledCircle':
                this.drawCircle(x,y,ctx, true, options);
                break;
            case 'square':
                this.drawSquare(x,y,ctx, false, options);
                break;
            case 'filledSquare':
                this.drawSquare(x,y,ctx, true, options);
                break;
            default:
                this.drawDiamond(x,y,ctx, false, options);
                break;
        }
    };
    
	// class: $.jqplot.shadowRenderer
	// The default jqPlot shadow renderer, rendering shadows behind shapes.
    $.jqplot.ShadowRenderer = function(options){ 
        // Group: Properties
        
        // prop: angle
        // Angle of the shadow in degrees.  Measured counter-clockwise from the x axis.
        this.angle = 45;
        // prop: offset
        // Pixel offset at the given shadow angle of each shadow stroke from the last stroke.
        this.offset = 1;
        // prop: alpha
        // alpha transparency of shadow stroke.
        this.alpha = 0.07;
        // prop: lineWidth
        // width of the shadow line stroke.
        this.lineWidth = 1.5;
        // prop: lineJoin
        // How line segments of the shadow are joined.
        this.lineJoin = 'miter';
        // prop: lineCap
        // how ends of the shadow line are rendered.
        this.lineCap = 'round';
        // prop; closePath
        // whether line path segment is closed upon itself.
        this.closePath = false;
        // prop: fill
        // whether to fill the shape.
        this.fill = false;
        // prop: depth
        // how many times the shadow is stroked.  Each stroke will be offset by offset at angle degrees.
        this.depth = 3;
        // prop: isarc
        // wether the shadow is an arc or not.
        this.isarc = false;
        
        $.extend(true, this, options);
    };
    
    $.jqplot.ShadowRenderer.prototype.init = function(options) {
        $.extend(true, this, options);
    };
    
    // function: draw
    // draws an transparent black (i.e. gray) shadow.
    //
    // ctx - canvas drawing context
    // points - array of points or [x, y, radius, start angle (rad), end angle (rad)]
    $.jqplot.ShadowRenderer.prototype.draw = function(ctx, points, options) {
        ctx.save();
        var opts = (options != null) ? options : {};
        var fill = (opts.fill != null) ? opts.fill : this.fill;
        var closePath = (opts.closePath != null) ? opts.closePath : this.closePath;
        var offset = (opts.offset != null) ? opts.offset : this.offset;
        var alpha = (opts.alpha != null) ? opts.alpha : this.alpha;
        var depth = (opts.depth != null) ? opts.depth : this.depth;
        ctx.lineWidth = (opts.lineWidth != null) ? opts.lineWidth : this.lineWidth;
        ctx.lineJoin = (opts.lineJoin != null) ? opts.lineJoin : this.lineJoin;
        ctx.lineCap = (opts.lineCap != null) ? opts.lineCap : this.lineCap;
        ctx.strokeStyle = 'rgba(0,0,0,'+alpha+')';
        ctx.fillStyle = 'rgba(0,0,0,'+alpha+')';
        for (var j=0; j<depth; j++) {
            ctx.translate(Math.cos(this.angle*Math.PI/180)*offset, Math.sin(this.angle*Math.PI/180)*offset);
            ctx.beginPath();
            if (this.isarc) {
                ctx.arc(points[0], points[1], points[2], points[3], points[4], true);                
            }
            else {
                ctx.moveTo(points[0][0], points[0][1]);
                for (var i=1; i<points.length; i++) {
                    ctx.lineTo(points[i][0], points[i][1]);
                }
                
            }
            if (closePath) {
            	ctx.closePath();
            }
            if (fill) {
            	ctx.fill();
            }
            else {
                ctx.stroke();
            }
        }
        ctx.restore();
    };
    
	// class: $.jqplot.shapeRenderer
	// The default jqPlot shape renderer.  Given a set of points will
	// plot them and either stroke a line (fill = false) or fill them (fill = true).
	// If a filled shape is desired, closePath = true must also be set to close
	// the shape.
    $.jqplot.ShapeRenderer = function(options){
        
        this.lineWidth = 1.5;
        // prop: lineJoin
        // How line segments of the shadow are joined.
        this.lineJoin = 'miter';
        // prop: lineCap
        // how ends of the shadow line are rendered.
        this.lineCap = 'round';
        // prop; closePath
        // whether line path segment is closed upon itself.
        this.closePath = false;
        // prop: fill
        // whether to fill the shape.
        this.fill = false;
        // prop: isarc
        // wether the shadow is an arc or not.
        this.isarc = false;
        // prop: fillRect
        // true to draw shape as a filled rectangle.
        this.fillRect = false;
        // prop: strokeRect
        // true to draw shape as a stroked rectangle.
        this.strokeRect = false;
        // prop: clearRect
        // true to cear a rectangle.
        this.clearRect = false;
        // prop: strokeStyle
        // css color spec for the stoke style
        this.strokeStyle = '#999999';
        // prop: fillStyle
        // css color spec for the fill style.
        this.fillStyle = '#999999'; 
        
        $.extend(true, this, options);
    };
    
    $.jqplot.ShapeRenderer.prototype.init = function(options) {
        $.extend(true, this, options);
    };
    
    // function: draw
    // draws the shape.
    //
    // ctx - canvas drawing context
    // points - array of points for shapes or 
    // [x, y, width, height] for rectangles or
    // [x, y, radius, start angle (rad), end angle (rad)] for circles and arcs.
    $.jqplot.ShapeRenderer.prototype.draw = function(ctx, points, options) {
        ctx.save();
        var opts = (options != null) ? options : {};
        var fill = (opts.fill != null) ? opts.fill : this.fill;
        var closePath = (opts.closePath != null) ? opts.closePath : this.closePath;
        var fillRect = (opts.fillRect != null) ? opts.fillRect : this.fillRect;
        var strokeRect = (opts.strokeRect != null) ? opts.strokeRect : this.strokeRect;
        var clearRect = (opts.clearRect != null) ? opts.clearRect : this.clearRect;
        var isarc = (opts.isarc != null) ? opts.isarc : this.isarc;
        ctx.lineWidth = opts.lineWidth || this.lineWidth;
        ctx.lineJoin = opts.lineJoing || this.lineJoin;
        ctx.lineCap = opts.lineCap || this.lineCap;
        ctx.strokeStyle = (opts.strokeStyle || opts.color) || this.strokeStyle;
        ctx.fillStyle = opts.fillStyle || this.fillStyle;
        ctx.beginPath();
        if (isarc) {
            ctx.arc(points[0], points[1], points[2], points[3], points[4], true);   
            if (closePath) {
                ctx.closePath();
            }
            if (fill) {
            	ctx.fill();
            }
            else {
                ctx.stroke();
            }             
        }
        else if (fillRect) {
            ctx.fillRect(points[0], points[1], points[2], points[3]);
        }
        else if (strokeRect) {
            ctx.strokeRect(points[0], points[1], points[2], points[3]);
        }
        else if (clearRect) {
            ctx.clearRect(points[0], points[1], points[2], points[3]);
        }
        else {
            ctx.moveTo(points[0][0], points[0][1]);
            for (var i=1; i<points.length; i++) {
                ctx.lineTo(points[i][0], points[i][1]);
            }
            if (closePath) {
                ctx.closePath();
            }
            if (fill) {
            	ctx.fill();
            }
            else {
                ctx.stroke();
            }
        }
        ctx.restore();
    };
    
    // class $.jqplot.TableLegendRenderer
    // The default legend renderer for jqPlot, this class has no options beyond the <Legend> class.
    $.jqplot.TableLegendRenderer.prototype.init = function(options) {
        $.extend(true, this, options);
    };
    
    $.jqplot.TableLegendRenderer.prototype.draw = function() {
        var legend = this;
        if (this.show) {
            var series = this._series;
            // make a table.  one line label per row.
            var ss = 'position:absolute;';
            ss += (this.background) ? 'background:'+this.background+';' : '';
            ss += (this.border) ? 'border:'+this.border+';' : '';
            ss += (this.fontSize) ? 'font-size:'+this.fontSize+';' : '';
            ss += (this.fontFamily) ? 'font-family:'+this.fontFamily+';' : '';
            ss += (this.textColor) ? 'color:'+this.textColor+';' : '';
            this._elem = $('<table class="jqplot-legend" style="'+ss+'"></table>');
        
            var pad = false;
            for (var i = 0; i< series.length; i++) {
                s = series[i];
                if (s.show) {
                    var lt = s.label.toString();
                    if (lt) {
                        var color = s.color;
                        if (s._stack && !s.fill) {
                            color = '';
                        }
                        addrow.call(this, lt, color, pad);
                        pad = true;
                    }
                    // let plugins add more rows to legend.  Used by trend line plugin.
                    for (var j=0; j<$.jqplot.addLegendRowHooks.length; j++) {
                        var item = $.jqplot.addLegendRowHooks[j].call(this, s);
                        if (item) {
                            addrow.call(this, item.label, item.color, pad);
                            pad = true;
                        } 
                    }
                }
            }
        }
        
        function addrow(label, color, pad) {
            var rs = (pad) ? this.rowSpacing : '0';
            var tr = $('<tr class="jqplot-legend"></tr>').appendTo(this._elem);
            $('<td class="jqplot-legend" style="vertical-align:middle;text-align:center;padding-top:'+rs+';">'+
                '<div style="border:1px solid #cccccc;padding:0.2em;">'+
                '<div style="width:1.2em;height:0.7em;background-color:'+color+';"></div>'+
                '</div></td>').appendTo(tr);
            var elem = $('<td class="jqplot-legend" style="vertical-align:middle;padding-top:'+rs+';"></td>');
            elem.appendTo(tr);
            if (this.escapeHtml) {
                elem.text(label);
            }
            else {
                elem.html(label);
            }
        }
        return this._elem;
    };
    
    $.jqplot.TableLegendRenderer.prototype.pack = function(offsets) {
        if (this.show) {
            // fake a grid for positioning
            var grid = {_top:offsets.top, _left:offsets.left, _right:offsets.right, _bottom:this._plotDimensions.height - offsets.bottom};      
            switch (this.location) {
                case 'nw':
                    var a = grid._left + this.xoffset;
                    var b = grid._top + this.yoffset;
                    this._elem.css('left', a);
                    this._elem.css('top', b);
                    break;
                case 'n':
                    var a = (offsets.left + (this._plotDimensions.width - offsets.right))/2 - this.getWidth()/2;
                    var b = grid._top + this.yoffset;
                    this._elem.css('left', a);
                    this._elem.css('top', b);
                    break;
                case 'ne':
                    var a = offsets.right + this.xoffset;
                    var b = grid._top + this.yoffset;
                    this._elem.css({right:a, top:b});
                    break;
                case 'e':
                    var a = offsets.right + this.xoffset;
                    var b = (offsets.top + (this._plotDimensions.height - offsets.bottom))/2 - this.getHeight()/2;
                    this._elem.css({right:a, top:b});
                    break;
                case 'se':
                    var a = offsets.right + this.xoffset;
                    var b = offsets.bottom + this.yoffset;
                    this._elem.css({right:a, bottom:b});
                    break;
                case 's':
                    var a = (offsets.left + (this._plotDimensions.width - offsets.right))/2 - this.getWidth()/2;
                    var b = offsets.bottom + this.yoffset;
                    this._elem.css({left:a, bottom:b});
                    break;
                case 'sw':
                    var a = grid._left + this.xoffset;
                    var b = offsets.bottom + this.yoffset;
                    this._elem.css({left:a, bottom:b});
                    break;
                case 'w':
                    var a = grid._left + this.xoffset;
                    var b = (offsets.top + (this._plotDimensions.height - offsets.bottom))/2 - this.getHeight()/2;
                    this._elem.css({left:a, top:b});
                    break;
                default:  // same as 'se'
                    var a = grid._right - this.xoffset;
                    var b = grid._bottom + this.yoffset;
                    this._elem.css({right:a, bottom:b});
                    break;
            }
        } 
    };
    	
    /**
     * JavaScript printf/sprintf functions.
     *
     * This code is unrestricted: you are free to use it however you like.
     * 
     * The functions should work as expected, performing left or right alignment,
     * truncating strings, outputting numbers with a required precision etc.
     *
     * For complex cases, these functions follow the Perl implementations of
     * (s)printf, allowing arguments to be passed out-of-order, and to set the
     * precision or length of the output based on arguments instead of fixed
     * numbers.
     *
     * See http://perldoc.perl.org/functions/sprintf.html for more information.
     *
     * Implemented:
     * - zero and space-padding
     * - right and left-alignment,
     * - base X prefix (binary, octal and hex)
     * - positive number prefix
     * - (minimum) width
     * - precision / truncation / maximum width
     * - out of order arguments
     *
     * Not implemented (yet):
     * - vector flag
     * - size (bytes, words, long-words etc.)
     * 
     * Will not implement:
     * - %n or %p (no pass-by-reference in JavaScript)
     *
     * @version 2007.04.27
     * @author Ash Searle
     */
     
     /**
      * @Modifications 2009.05.26
      * @author Chris Leonello
      * 
      * Added %p %P specifier
      * Acts like %g or %G but will not add more significant digits to the output than present in the input.
      * Example:
      * Format: '%.3p', Input: 0.012, Output: 0.012
      * Format: '%.3g', Input: 0.012, Output: 0.0120
      * Format: '%.4p', Input: 12.0, Output: 12.0
      * Format: '%.4g', Input: 12.0, Output: 12.00
      * Format: '%.4p', Input: 4.321e-5, Output: 4.321e-5
      * Format: '%.4g', Input: 4.321e-5, Output: 4.3210e-5
      */
    $.jqplot.sprintf = function() {
        function pad(str, len, chr, leftJustify) {
    	    var padding = (str.length >= len) ? '' : Array(1 + len - str.length >>> 0).join(chr);
        	return leftJustify ? str + padding : padding + str;

        }

        function justify(value, prefix, leftJustify, minWidth, zeroPad) {
    	    var diff = minWidth - value.length;
        	if (diff > 0) {
        	    if (leftJustify || !zeroPad) {
        		    value = pad(value, minWidth, ' ', leftJustify);
        	    } else {
        		    value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
        	    }
        	}
        	return value;
        }

        function formatBaseX(value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
        	// Note: casts negative numbers to positive ones
        	var number = value >>> 0;
        	prefix = prefix && number && {'2': '0b', '8': '0', '16': '0x'}[base] || '';
        	value = prefix + pad(number.toString(base), precision || 0, '0', false);
        	return justify(value, prefix, leftJustify, minWidth, zeroPad);
        }

        function formatString(value, leftJustify, minWidth, precision, zeroPad) {
        	if (precision != null) {
        	    value = value.slice(0, precision);
        	}
        	return justify(value, '', leftJustify, minWidth, zeroPad);
        }

        var a = arguments, i = 0, format = a[i++];

        return format.replace($.jqplot.sprintf.regex, function(substring, valueIndex, flags, minWidth, _, precision, type) {
    	    if (substring == '%%') return '%';

    	    // parse flags
    	    var leftJustify = false, positivePrefix = '', zeroPad = false, prefixBaseX = false;
        	    for (var j = 0; flags && j < flags.length; j++) switch (flags.charAt(j)) {
        		case ' ': positivePrefix = ' '; break;
        		case '+': positivePrefix = '+'; break;
        		case '-': leftJustify = true; break;
        		case '0': zeroPad = true; break;
        		case '#': prefixBaseX = true; break;
    	    }

    	    // parameters may be null, undefined, empty-string or real valued
    	    // we want to ignore null, undefined and empty-string values

    	    if (!minWidth) {
    		    minWidth = 0;
    	    } 
    	    else if (minWidth == '*') {
    		    minWidth = +a[i++];
    	    } 
    	    else if (minWidth.charAt(0) == '*') {
    		    minWidth = +a[minWidth.slice(1, -1)];
    	    } 
    	    else {
    		    minWidth = +minWidth;
    	    }

    	    // Note: undocumented perl feature:
    	    if (minWidth < 0) {
        		minWidth = -minWidth;
        		leftJustify = true;
    	    }

    	    if (!isFinite(minWidth)) {
    		    throw new Error('$.jqplot.sprintf: (minimum-)width must be finite');
    	    }

    	    if (!precision) {
    		    precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type == 'd') ? 0 : void(0);
    	    } 
    	    else if (precision == '*') {
    		    precision = +a[i++];
    	    } 
    	    else if (precision.charAt(0) == '*') {
    		    precision = +a[precision.slice(1, -1)];
    	    } 
    	    else {
    		    precision = +precision;
    	    }

    	    // grab value using valueIndex if required?
    	    var value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

    	    switch (type) {
    		case 's': return formatString(String(value), leftJustify, minWidth, precision, zeroPad);
    		case 'c': return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
    		case 'b': return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
    		case 'o': return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
    		case 'x': return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
    		case 'X': return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
    		case 'u': return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
    		case 'i':
    		case 'd': {
              var number = parseInt(+value);
              var prefix = number < 0 ? '-' : positivePrefix;
              value = prefix + pad(String(Math.abs(number)), precision, '0', false);
              return justify(value, prefix, leftJustify, minWidth, zeroPad);
    			  }
    		case 'e':
    		case 'E':
    		case 'f':
    		case 'F':
    		case 'g':
    		case 'G':
    		          {
    			      var number = +value;
    			      var prefix = number < 0 ? '-' : positivePrefix;
    			      var method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
    			      var textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
    			      value = prefix + Math.abs(number)[method](precision);
    			      return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
    			  }
    		case 'p':
    		case 'P':
    		{
    		    // make sure number is a number
                var number = +value;
                var prefix = number < 0 ? '-' : positivePrefix;

                var parts = String(Number(Math.abs(number)).toExponential()).split(/e|E/);
                var sd = (parts[0].indexOf('.') != -1) ? parts[0].length - 1 : parts[0].length;
                var zeros = (parts[1] < 0) ? -parts[1] - 1 : 0;
                
                if (Math.abs(number) < 1) {
                    if (sd + zeros  <= precision) {
                        value = prefix + Math.abs(number).toPrecision(sd);
                    }
                    else {
                        if (sd  <= precision - 1) {
                            value = prefix + Math.abs(number).toExponential(sd-1);
                        }
                        else {
                            value = prefix + Math.abs(number).toExponential(precision-1);
                        }
                    }
                }
                else {
                    var prec = (sd <= precision) ? sd : precision;
                    value = prefix + Math.abs(number).toPrecision(prec);
                }
                var textTransform = ['toString', 'toUpperCase']['pP'.indexOf(type) % 2];
                return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
            }
    		default: return substring;
    	    }
    		    });
    };
    
    $.jqplot.sprintf.regex = /%%|%(\d+\$)?([-+#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuidfegpEGP])/g;

})(jQuery);  