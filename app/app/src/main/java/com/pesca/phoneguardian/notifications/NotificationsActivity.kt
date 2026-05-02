package com.pesca.phoneguardian.notifications

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.pesca.phoneguardian.R
import com.pesca.phoneguardian.api.ApiClient
import com.pesca.phoneguardian.api.NotificationReadRequest
import com.pesca.phoneguardian.databinding.ActivityNotificationsBinding
import com.pesca.phoneguardian.util.Prefs
import kotlinx.coroutines.launch

class NotificationsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityNotificationsBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityNotificationsBinding.inflate(layoutInflater)
        setContentView(binding.root)
        binding.toolbar.setNavigationOnClickListener { finish() }
        binding.recycler.layoutManager = LinearLayoutManager(this)
    }

    override fun onResume() {
        super.onResume()
        reload()
    }

    private fun reload() {
        val phone = Prefs.getPhone(this)
        if (phone.isNullOrBlank()) {
            Toast.makeText(this, R.string.notifications_need_phone, Toast.LENGTH_LONG).show()
            finish()
            return
        }
        lifecycleScope.launch {
            try {
                val list = ApiClient.mobile.notifications(phone)
                binding.recycler.adapter = NotificationsAdapter(list) { n ->
                    if (!n.isRead) {
                        lifecycleScope.launch {
                            try {
                                ApiClient.mobile.markRead(
                                    NotificationReadRequest(phone, listOf(n.id)),
                                )
                                reload()
                            } catch (_: Exception) {
                            }
                        }
                    }
                }
            } catch (_: Exception) {
                Toast.makeText(this@NotificationsActivity, R.string.submit_fail, Toast.LENGTH_SHORT).show()
            }
        }
    }
}
