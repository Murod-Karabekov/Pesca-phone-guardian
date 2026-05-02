package com.pesca.phoneguardian.notifications

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.pesca.phoneguardian.api.NotificationDto
import com.pesca.phoneguardian.databinding.ItemNotificationBinding

class NotificationsAdapter(
    private val items: List<NotificationDto>,
    private val onOpen: (NotificationDto) -> Unit,
) : RecyclerView.Adapter<NotificationsAdapter.VH>() {

    class VH(val binding: ItemNotificationBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val b = ItemNotificationBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return VH(b)
    }

    override fun getItemCount() = items.size

    override fun onBindViewHolder(holder: VH, position: Int) {
        val n = items[position]
        val b = holder.binding
        b.title.text = n.title
        b.message.text = n.message
        b.typeBadge.text = "${n.type}${if (!n.isRead) " · NEW" else ""}"
        b.root.setOnClickListener { onOpen(n) }
    }
}
