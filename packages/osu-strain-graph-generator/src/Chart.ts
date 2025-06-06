import { Canvas, Image, createCanvas, CanvasRenderingContext2D } from "canvas";
import { Vector2 } from "@rian8337/osu-base";

type AxisType = "time";

interface ChartInitializer {
    /**
     * The width of the graph.
     */
    readonly graphWidth: number;

    /**
     * The height of the graph.
     */
    readonly graphHeight: number;

    /**
     * The minimum X axis value of the graph.
     */
    readonly minX: number;

    /**
     * The minimum Y axis value of this graph.
     */
    readonly minY: number;

    /**
     * The maximum X axis value of this graph.
     */
    readonly maxX: number;

    /**
     * The maximum Y axis value of this graph.
     */
    readonly maxY: number;

    /**
     * The units per tick for X axis.
     */
    readonly unitsPerTickX: number;

    /**
     * The units per tick for Y axis.
     */
    readonly unitsPerTickY: number;

    /**
     * The background of this graph.
     */
    readonly background?: Image;

    /**
     * The X axis label of the graph. When undefined, the X axis will not be drawn.
     */
    readonly xLabel?: string;

    /**
     * The Y axis label of the graph. When undefined, the Y axis will not be drawn.
     */
    readonly yLabel?: string;

    /**
     * The radius of a data point in the graph. Set to 0 to disable this.
     */
    readonly pointRadius?: number;

    /**
     * The value type for X axis.
     */
    readonly xValueType?: AxisType;

    /**
     * The value type for Y axis.
     */
    readonly yValueType?: AxisType;
}

/**
 * Utility to draw a graph with only node-canvas.
 *
 * Used for creating strain graph of beatmaps.
 */
export class Chart implements ChartInitializer {
    /**
     * The canvas instance of this chart.
     */
    readonly canvas: Canvas;

    /**
     * The 2D rendering surface for the drawing surface of this chart.
     */
    readonly context: CanvasRenderingContext2D;

    readonly graphWidth: number;
    readonly graphHeight: number;
    readonly minX: number;
    readonly minY: number;
    readonly maxX: number;
    readonly maxY: number;
    readonly unitsPerTickX: number;
    readonly unitsPerTickY: number;
    readonly background?: Image;
    readonly xLabel?: string;
    readonly yLabel?: string;
    readonly xValueType?: AxisType;
    readonly yValueType?: AxisType;
    readonly pointRadius: number;

    private readonly padding = 10;
    private readonly tickSize = 10;
    private readonly axisColor = "#424242";
    private readonly font = "12pt Calibri";
    private readonly axisLabelFont = "bold 11pt Calibri";
    private readonly fontHeight = 12;
    private readonly baseLabelOffset = 15;

    private readonly rangeX: number;
    private readonly rangeY: number;
    private readonly numXTicks: number;
    private readonly numYTicks: number;
    private readonly x: number;
    private readonly y: number;
    private readonly width: number;
    private readonly height: number;
    private readonly scaleX: number;
    private readonly scaleY: number;

    /**
     * @param values Initializer options for the graph.
     */
    constructor(values: ChartInitializer) {
        this.graphWidth = values.graphWidth;
        this.graphHeight = values.graphHeight;

        this.canvas = createCanvas(this.graphWidth, this.graphHeight);
        this.context = this.canvas.getContext("2d");
        this.minX = values.minX;
        this.minY = values.minY;
        this.maxX = values.maxX;
        this.maxY = values.maxY;
        this.unitsPerTickX = values.unitsPerTickX;
        this.unitsPerTickY = values.unitsPerTickY;
        this.background = values.background;
        this.xLabel = values.xLabel;
        this.yLabel = values.yLabel;
        this.xValueType = values.xValueType;
        this.yValueType = values.yValueType;
        this.pointRadius = Math.max(0, values.pointRadius ?? 1);

        // Relationships
        this.rangeX = this.maxX - this.minX;
        this.rangeY = this.maxY - this.minY;
        this.numXTicks = Math.round(this.rangeX / this.unitsPerTickX);
        this.numYTicks = Math.round(this.rangeY / this.unitsPerTickY);
        this.x = this.getLongestValueWidth() + this.padding * 2;
        this.y = this.padding * 2;
        this.width = this.canvas.width - this.x - this.padding * 2;
        this.height =
            this.canvas.height - this.y - this.padding - this.fontHeight;
        this.scaleX =
            (this.width - (this.xLabel ? this.baseLabelOffset : 0)) /
            this.rangeX;
        this.scaleY =
            (this.height - (this.yLabel ? this.baseLabelOffset : 0)) /
            this.rangeY;

        // Draw background and X and Y axis tick marks
        this.setBackground();

        if (this.xLabel !== undefined) {
            this.drawXAxis();
        }

        if (this.yLabel !== undefined) {
            this.drawYAxis();
        }
    }

    /**
     * Draws a line graph with specified data, color, and line width.
     *
     * @param data The data to make the graph.
     * @param color The color of the line.
     * @param width The width of the line.
     */
    drawLine(data: Vector2[], color: string, width: number): void {
        const c = this.context;
        c.save();
        this.transformContext();
        c.lineWidth = width;
        c.strokeStyle = c.fillStyle = color;
        c.beginPath();
        c.moveTo(data[0].x * this.scaleX, data[0].y * this.scaleY);

        for (let n = 0; n < data.length; ++n) {
            const point = data[n];

            // Data segment
            c.lineTo(point.x * this.scaleX, point.y * this.scaleY);
            c.stroke();
            c.closePath();
            if (this.pointRadius) {
                c.beginPath();
                c.arc(
                    point.x * this.scaleX,
                    point.y * this.scaleY,
                    this.pointRadius,
                    0,
                    2 * Math.PI,
                    false,
                );
                c.fill();
                c.closePath();
            }

            // Position for next segment
            c.beginPath();
            c.moveTo(point.x * this.scaleX, point.y * this.scaleY);
        }

        c.restore();
    }

    /**
     * Draws an area graph with specified data and color.
     *
     * @param data The data to make the graph.
     * @param color The color of the area.
     */
    drawArea(data: Vector2[], color: string): void {
        const c = this.context;
        c.save();
        this.transformContext();
        c.strokeStyle = c.fillStyle = color;

        c.beginPath();
        data.forEach((d) => c.lineTo(d.x * this.scaleX, d.y * this.scaleY));
        c.stroke();
        c.lineTo(data.at(-1)!.x * this.scaleX, 0);
        c.lineTo(0, 0);
        c.fill();

        c.restore();

        // Redraw axes since it gets overlapped by chart area.
        if (color !== this.axisColor) {
            if (this.xLabel !== undefined) {
                this.drawXAxis();
            }

            if (this.yLabel !== undefined) {
                this.drawYAxis();
            }
        }
    }

    /**
     * Returns a Buffer that represents the graph.
     */
    getBuffer(): Buffer {
        return this.canvas.toBuffer();
    }

    /**
     * Draws the X axis of the graph.
     */
    private drawXAxis(): void {
        const c = this.context;
        const labelOffset = this.xLabel ? this.baseLabelOffset : 0;
        const yLabelOffset = this.yLabel ? this.baseLabelOffset : 0;

        c.save();
        if (this.xLabel) {
            c.textAlign = "center";
            c.font = this.axisLabelFont;
            c.fillText(
                this.xLabel,
                this.x + this.width / 2,
                this.y + this.height + labelOffset,
            );
            c.restore();
        }
        c.beginPath();
        c.moveTo(this.x + yLabelOffset, this.y + this.height - labelOffset);
        c.lineTo(this.x + this.width, this.y + this.height - labelOffset);
        c.strokeStyle = this.axisColor;
        c.lineWidth = 2;
        c.stroke();

        // Draw tick marks
        for (let n = 0; n <= this.numXTicks; ++n) {
            c.beginPath();
            c.moveTo(
                (n * (this.width - yLabelOffset)) / this.numXTicks +
                    this.x +
                    yLabelOffset,
                this.y + this.height - labelOffset,
            );
            c.lineTo(
                (n * (this.width - yLabelOffset)) / this.numXTicks +
                    this.x +
                    yLabelOffset,
                this.y + this.height - labelOffset - this.tickSize,
            );
            c.stroke();
        }

        // Draw labels
        c.font = this.font;
        c.fillStyle = "black";
        c.textAlign = "center";
        c.textBaseline = "middle";

        if (this.xLabel !== undefined) {
            for (let n = 0; n <= this.numXTicks; ++n) {
                const label = Math.round((n * this.maxX) / this.numXTicks);
                let stringLabel = label.toString();
                switch (this.xValueType) {
                    case "time":
                        stringLabel = this.timeString(label);
                        break;
                }
                c.save();
                c.translate(
                    (n * (this.width - yLabelOffset)) / this.numXTicks +
                        this.x +
                        yLabelOffset,
                    this.y + this.height + this.padding - labelOffset,
                );
                c.fillText(stringLabel, 0, 0);
                c.restore();
            }
        }

        c.restore();
    }

    /**
     * Draws the Y axis of the graph.
     *
     * @param drawLabel Whether or not to draw the axis label.
     */
    private drawYAxis(): void {
        const c = this.context;
        const labelOffset = this.yLabel ? this.baseLabelOffset : 0;
        const xLabelOffset = this.xLabel ? this.baseLabelOffset : 0;

        c.save();
        if (this.yLabel) {
            c.textAlign = "center";
            c.font = this.axisLabelFont;
            c.translate(0, this.graphHeight);
            c.rotate(-Math.PI / 2);
            c.fillText(
                this.yLabel,
                this.y + xLabelOffset + this.height / 2,
                this.x - labelOffset * 2.5,
            );
            c.restore();
        }
        c.beginPath();
        c.moveTo(this.x + labelOffset, this.y);
        c.lineTo(this.x + labelOffset, this.y + this.height - xLabelOffset);
        c.strokeStyle = this.axisColor;
        c.lineWidth = 2;
        c.stroke();
        c.restore();

        // Draw tick marks
        if (this.yLabel !== undefined) {
            for (let n = 0; n < this.numYTicks; ++n) {
                c.beginPath();
                c.moveTo(
                    this.x + labelOffset,
                    (n * (this.height - xLabelOffset)) / this.numYTicks +
                        this.y,
                );
                c.lineTo(
                    this.x + labelOffset + this.tickSize,
                    (n * (this.height - xLabelOffset)) / this.numYTicks +
                        this.y,
                );
                c.stroke();
            }
        }

        // Draw values
        c.font = this.font;
        c.fillStyle = "black";
        c.textAlign = "right";
        c.textBaseline = "middle";

        for (let n = 0; n < this.numYTicks; ++n) {
            const value = Math.round(
                this.maxY - (n * this.maxY) / this.numYTicks,
            );
            c.save();
            c.translate(
                this.x + labelOffset - this.padding,
                (n * (this.height - xLabelOffset)) / this.numYTicks + this.y,
            );
            c.fillText(value.toString(), 0, 0);
            c.restore();
        }

        c.restore();
    }

    /**
     * Transforms the context and move it to the center of the graph.
     */
    private transformContext(): void {
        const c = this.context;

        // Move context to point (0, 0) in graph
        c.translate(
            this.x + (this.yLabel ? this.baseLabelOffset : 0),
            this.y + this.height - (this.xLabel ? this.baseLabelOffset : 0),
        );

        // Invert the Y scale so that it increments as we go upwards
        c.scale(1, -1);
    }

    /**
     * Gets the longest width from each label text in Y axis.
     */
    private getLongestValueWidth(): number {
        if (this.yLabel === undefined) {
            return 0;
        }

        this.context.font = this.font;
        let longestValueWidth = 0;
        for (let n = 0; n < this.numYTicks; ++n) {
            const value = this.maxY - n * this.unitsPerTickY;
            let stringValue = value.toString();
            switch (this.yValueType) {
                case "time":
                    stringValue = this.timeString(value);
                    break;
            }
            longestValueWidth = Math.max(
                longestValueWidth,
                this.context.measureText(stringValue).width,
            );
        }
        return longestValueWidth;
    }

    /**
     * Sets the background of the graph.
     */
    private setBackground(): void {
        if (!this.background) {
            this.context.globalAlpha = 0.7;
            this.context.fillStyle = "#ffffff";
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.fillStyle = "#000000";
            return;
        }
        this.context.globalAlpha = 1;
        this.context.drawImage(
            this.background,
            0,
            0,
            this.canvas.width,
            this.canvas.height,
        );
        this.context.globalAlpha = 0.8;
        this.context.fillStyle = "#bbbbbb";
        this.context.fillRect(0, 0, 900, 250);
        this.context.globalAlpha = 1;
        this.context.fillStyle = "#000000";
    }

    /**
     * Time string parsing function for axis labels.
     */
    private timeString(seconds: number): string {
        seconds = Math.trunc(seconds);

        const days = Math.floor(seconds / 86400);
        seconds -= days * 86400;

        const hours = Math.floor(seconds / 3600);
        seconds -= hours * 3600;

        const minutes = Math.floor(seconds / 60);
        seconds -= minutes * 60;

        const final = [minutes.toString(), seconds.toString().padStart(2, "0")];

        if (hours > 0) {
            final.unshift(hours.toString());
        }

        if (days > 0) {
            final.unshift(days.toString());
        }

        return final.join(":");
    }
}
