package com.pesca.phoneguardian

import android.media.MediaPlayer
import android.os.Bundle
import android.widget.Button
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity

class WarningActivity : AppCompatActivity() {

    private var mediaPlayer: MediaPlayer? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_warning)
        setFinishOnTouchOutside(false)

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                // Force explicit user action from the warning button.
            }
        })

        findViewById<Button>(R.id.closeWarningButton).setOnClickListener {
            ApkInstallAccessibilityService.suppressWarningsTemporarily()
            finish()
        }
    }

    override fun onStart() {
        super.onStart()
        releasePlayer()
        mediaPlayer = MediaPlayer.create(this, R.raw.warning)?.apply {
            setOnCompletionListener { releasePlayer() }
            start()
        }
    }

    override fun onStop() {
        releasePlayer()
        super.onStop()
    }

    private fun releasePlayer() {
        mediaPlayer?.run {
            try {
                if (isPlaying) stop()
            } catch (_: IllegalStateException) {
            }
            release()
        }
        mediaPlayer = null
    }
}
