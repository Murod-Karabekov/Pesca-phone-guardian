package com.pesca.phoneguardian.api

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface MobileApi {

    @POST("mobile/register")
    suspend fun register(@Body body: MobileRegisterRequest): MobileRegisterResponse

    @POST("mobile/scan-report")
    suspend fun submitScan(@Body body: MobileScanReportRequest): MobileScanReportResponse

    @GET("mobile/notifications/{phone}")
    suspend fun notifications(@Path("phone", encoded = true) phone: String): List<NotificationDto>

    @POST("mobile/notifications/read")
    suspend fun markRead(@Body body: NotificationReadRequest): OkResponse
}
