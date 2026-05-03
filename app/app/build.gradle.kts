import java.net.URI
import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

val localProps = Properties().apply {
    val f = rootProject.file("local.properties")
    if (f.exists()) f.inputStream().use { load(it) }
}
val apiBaseUrl = (localProps.getProperty("API_BASE_URL") ?: "http://10.0.2.2:3000/api/").trim()
    .let { if (it.endsWith("/")) it else "$it/" }

/** HTTP API_BASE_URL bo'lsa, Android cleartext uchun shu host qo'shiladi (VDS IP va hokazo). */
fun httpCleartextHost(url: String): String? =
    runCatching {
        val u = URI(url.trim())
        if (!u.scheme.equals("http", ignoreCase = true)) return null
        val h = u.host ?: return null
        if (!h.matches(Regex("^[a-zA-Z0-9.:\\-]+$"))) return null
        h
    }.getOrNull()

val cleartextHostFromApi: String? = httpCleartextHost(apiBaseUrl)

val generateNetworkSecurityConfig = tasks.register("generateNetworkSecurityConfig") {
    val outFile = layout.buildDirectory.file("generated/network-security/res/xml/network_security_config.xml")
    outputs.file(outFile)
    inputs.property("cleartextHost", cleartextHostFromApi ?: "")
    inputs.property("apiBaseUrl", apiBaseUrl)

    doLast {
        val out = outFile.get().asFile
        out.parentFile.mkdirs()
        out.writeText(
            buildString {
                appendLine("<?xml version=\"1.0\" encoding=\"utf-8\"?>")
                appendLine("<network-security-config>")
                appendLine("    <domain-config cleartextTrafficPermitted=\"true\">")
                appendLine("        <domain includeSubdomains=\"true\">10.0.2.2</domain>")
                appendLine("        <domain includeSubdomains=\"true\">localhost</domain>")
                appendLine("        <domain includeSubdomains=\"true\">127.0.0.1</domain>")
                cleartextHostFromApi?.let { h ->
                    appendLine("        <domain includeSubdomains=\"false\">$h</domain>")
                }
                appendLine("    </domain-config>")
                appendLine("    <debug-overrides>")
                appendLine("        <base-config cleartextTrafficPermitted=\"true\" />")
                appendLine("    </debug-overrides>")
                appendLine("</network-security-config>")
            },
        )
    }
}

android {
    namespace = "com.pesca.phoneguardian"
    compileSdk = 35

    sourceSets.getByName("main").res.srcDir(layout.buildDirectory.dir("generated/network-security/res"))

    defaultConfig {
        applicationId = "com.pesca.phoneguardian"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "0.1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        buildConfigField("String", "API_BASE_URL", "\"${apiBaseUrl.replace("\\", "\\\\").replace("\"", "\\\"")}\"")
    }

    buildFeatures {
        buildConfig = true
        viewBinding = true
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

afterEvaluate {
    tasks.named("preBuild").configure { dependsOn(generateNetworkSecurityConfig) }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("androidx.recyclerview:recyclerview:1.3.2")
    implementation("androidx.activity:activity-ktx:1.9.3")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    implementation("io.coil-kt:coil:2.7.0")
}
