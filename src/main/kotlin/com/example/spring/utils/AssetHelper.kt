package com.example.spring.utils

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import org.springframework.beans.factory.InitializingBean
import org.springframework.core.env.Environment
import org.springframework.core.env.Profiles
import org.springframework.core.io.ClassPathResource
import org.springframework.stereotype.Component
import java.util.concurrent.ConcurrentHashMap

@Component("assetHelper")
class AssetHelper(
    private val env: Environment
) : InitializingBean {

    private val mapper: ObjectMapper = ObjectMapper().registerKotlinModule()

    // Adjust if your outDir is different; with Vite build.manifest=true and outDir=static.
    private val manifestPath = "static/manifest.json"
    private val manifestRes = ClassPathResource(manifestPath)

    // Compute dev mode robustly: dev profile OR no manifest on classpath.
    private val isDev: Boolean
        get() = env.acceptsProfiles(Profiles.of("dev")) || !manifestRes.exists()

    private val manifest: MutableMap<String, ManifestEntry> = ConcurrentHashMap()

    override fun afterPropertiesSet() {
        if (!isDev) {
            // Production: manifest must exist
            require(manifestRes.exists()) { "Vite manifest not found at classpath:$manifestPath" }
            manifestRes.inputStream.use { input ->
                val typeRef = object : TypeReference<Map<String, ManifestEntry>>() {}
                val map: Map<String, ManifestEntry> = mapper.readValue(input, typeRef)
                manifest.putAll(map)
            }
        } else {
            // Dev: do nothing (load from Vite dev server)
        }
    }

    fun tag(fileName: String): String {
        require(fileName.isNotBlank()) { "Filename must not be blank." }
        return when (fileName.substringAfterLast('.', "").lowercase()) {
            "js", "ts", "tsx", "jsx" -> scriptTag(fileName)
            "css" -> cssTag(fileName)
            else -> error("Only JS/TS/JSX/TSX and CSS are supported.")
        }
    }

    private fun scriptTag(fileName: String): String {
        return if (isDev) {
            val devServer = viteDevServer()
            """
            <script type="module">
              import RefreshRuntime from "$devServer/@react-refresh"
              RefreshRuntime.injectIntoGlobalHook(window)
              window.${"$"}RefreshReg$ = () => {}
              window.${"$"}RefreshSig$ = () => (type) => type
              window.__vite_plugin_react_preamble_installed__ = true
            </script>
            <script type="module" src="$devServer/@vite/client"></script>
            <script type="module" src="$devServer/src/$fileName"></script>
            """.trimIndent()
        } else {
            val entry = findEntryFor("src/$fileName") ?: findBySuffix(fileName)
            val outFile = entry?.file ?: error("Manifest entry missing 'file' for $fileName")
            """<script type="module" src="${cdnPrefix()}/$outFile"></script>"""
        }
    }

    private fun cssTag(fileName: String): String {
        return if (isDev) {
            """<link rel="stylesheet" href="${viteDevServer()}/$fileName" />"""
        } else {
            manifest[fileName]?.file?.let { cssOut ->
                return """<link rel="stylesheet" href="${cdnPrefix()}/$cssOut" />"""
            }
            findBySuffix(fileName)?.file?.let { cssOut ->
                return """<link rel="stylesheet" href="${cdnPrefix()}/$cssOut" />"""
            }
            val anyCss = manifest.values.asSequence()
                .flatMap { (it.css ?: emptyList()).asSequence() }
                .firstOrNull()
            requireNotNull(anyCss) { "CSS for $fileName not found in manifest." }
            """<link rel="stylesheet" href="${cdnPrefix()}/$anyCss" />"""
        }
    }

    private fun findEntryFor(key: String): ManifestEntry? = manifest[key]

    private fun findBySuffix(suffix: String): ManifestEntry? =
        manifest.entries.firstOrNull { it.key.endsWith(suffix, ignoreCase = true) }?.value

    // --- Config helpers (env-driven) ---

    private fun viteDevServer(): String =
        env.getProperty("app.assets.devServer", "http://localhost:5173").trimEnd('/')

    private fun cdnPrefix(): String =
        env.getProperty("app.assets.cdnBaseUrl", "").trimEnd('/')
}
