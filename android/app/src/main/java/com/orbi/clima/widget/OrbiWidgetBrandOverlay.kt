package com.orbi.clima.widget

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.Rect
import android.graphics.RectF
import android.graphics.Typeface
import com.orbi.clima.R
import kotlin.math.min

/**
 * OC-22P official ORBI Clima branding overlay for native launcher widgets.
 *
 * The weather composition remains owned by Fluid V3. This layer only replaces
 * the legacy text-only brand area with the official application icon + wordmark.
 * It intentionally stays clear of the source/LIVE badge on the right.
 */
object OrbiWidgetBrandOverlay {
    private const val OBSIDIAN_BRAND = 0xEE020611.toInt()
    private const val CYAN = 0xFF67E8F9.toInt()
    private const val WHITE = 0xFFF8FAFC.toInt()

    fun apply(
        context: Context,
        source: Bitmap,
        variant: OrbiNativeWidgetSnapshotRendererV2.Variant,
    ): Bitmap {
        val bitmap = if (source.isMutable) source else source.copy(Bitmap.Config.ARGB_8888, true)
        val canvas = Canvas(bitmap)
        val width = bitmap.width.toFloat()
        val height = bitmap.height.toFloat()
        val side = min(width, height)
        val compact = variant == OrbiNativeWidgetSnapshotRendererV2.Variant.MINI

        val iconSize = (side * if (compact) 0.086f else 0.072f).coerceIn(24f, 62f)
        val left = width * 0.035f
        val top = height * 0.027f
        val patchHeight = iconSize * 1.24f
        val patchWidth = (iconSize + width * if (compact) 0.39f else 0.31f)
            .coerceAtMost(width * 0.57f)
        val patch = RectF(left - iconSize * 0.14f, top - iconSize * 0.11f, left + patchWidth, top + patchHeight)
        val patchRadius = iconSize * 0.28f

        canvas.drawRoundRect(
            patch,
            patchRadius,
            patchRadius,
            Paint(Paint.ANTI_ALIAS_FLAG).apply { color = OBSIDIAN_BRAND },
        )

        val icon = BitmapFactory.decodeResource(context.resources, R.drawable.orbi_clima_app_icon)
        if (icon != null) {
            val iconRect = RectF(left, top, left + iconSize, top + iconSize)
            val iconPath = Path().apply {
                addRoundRect(iconRect, iconSize * 0.24f, iconSize * 0.24f, Path.Direction.CW)
            }
            canvas.save()
            canvas.clipPath(iconPath)
            canvas.drawBitmap(icon, Rect(0, 0, icon.width, icon.height), iconRect, Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG))
            canvas.restore()
            canvas.drawRoundRect(
                iconRect,
                iconSize * 0.24f,
                iconSize * 0.24f,
                Paint(Paint.ANTI_ALIAS_FLAG).apply {
                    style = Paint.Style.STROKE
                    strokeWidth = (side * 0.0022f).coerceAtLeast(1f)
                    color = 0x8067E8F9.toInt()
                },
            )
        }

        val textX = left + iconSize * 1.22f
        val baseline = top + iconSize * 0.66f
        val textSize = (side * if (compact) 0.039f else 0.033f).coerceIn(11f, 30f)
        val brandPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            this.textSize = textSize
            color = WHITE
        }
        canvas.drawText("ORBI", textX, baseline, brandPaint)
        val orbiWidth = brandPaint.measureText("ORBI")
        brandPaint.color = CYAN
        canvas.drawText(" CLIMA IA", textX + orbiWidth, baseline, brandPaint)

        return bitmap
    }
}
