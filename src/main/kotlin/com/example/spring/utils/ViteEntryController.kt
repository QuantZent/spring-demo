package com.example.spring.utils

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import jakarta.servlet.http.HttpServletResponse
import org.springframework.core.env.Environment
import org.springframework.core.env.Profiles
import org.springframework.core.io.ClassPathResource
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

@RestController
class ViteEntryController(
    private val env: Environment
) {
    private val mapper = ObjectMapper().registerKotlinModule()
    private val manifestRes = ClassPathResource("static/manifest.json")

    private fun isDev(): Boolean =
        env.acceptsProfiles(Profiles.of("dev")) || !manifestRes.exists()

    private fun viteDevServer(): String =
        env.getProperty("app.assets.devServer", "http://localhost:5173").trimEnd('/')

    private fun entryFileName(): String =
        env.getProperty("app.assets.entry", "src/main.tsx") // configure your entry once

    @GetMapping("/vite/entry.mjs", produces = [MediaType.APPLICATION_OCTET_STREAM_VALUE])
    fun entryModule(resp: HttpServletResponse) {
        resp.contentType = "application/javascript; charset=utf-8"
        val code = if (isDev()) devModule() else prodModule()
        resp.writer.use { it.write(code) }
    }

    private fun devModule(): String {
        val dev = viteDevServer()
        val entry = entryFileName()
        return """
            // DEV Vite bootstrap
            import RefreshRuntime from '$dev/@react-refresh';
            RefreshRuntime.injectIntoGlobalHook(window);
            window.$${"$"}RefreshReg$ = () => {};
            window.$${"$"}RefreshSig$ = () => (type) => type;
            window.__vite_plugin_react_preamble_installed__ = true;

            import '$dev/@vite/client';
            import '$dev/$entry';
        """.trimIndent()
    }

    private fun prodModule(): String {
        // Parse manifest.json once per request (small file). You can memoize if desired.
        val mapType = mapper.typeFactory.constructMapType(
            Map::class.java, String::class.java, ManifestEntry::class.java
        )
        manifestRes.inputStream.use { input ->
            val manifest: Map<String, ManifestEntry> = mapper.readValue(input, mapType)

            val entry = manifest[entryFileName()]
                ?: manifest.entries.firstOrNull { it.value.isEntry == true }?.value
                ?: error("Cannot locate manifest entry for ${entryFileName()}")

            val cssList = (entry.css ?: emptyList())
            val jsFile = requireNotNull(entry.file) { "Manifest entry missing 'file'." }

            // Build a tiny module that injects <link rel="stylesheet"> for all CSS,
            // then dynamically imports the hashed JS.
            val cssInjections = cssList.joinToString("\n") { css ->
                val href = jsString(css)
                "const l=document.createElement('link'); l.rel='stylesheet'; l.href='${'$'}{base}$href'; document.head.appendChild(l);"
            }

            return """
                // PROD Vite bootstrap
                const base = ${jsBaseUrl()};
                ${cssInjections.ifBlank { "// no css" }}
                import(/* @vite-ignore */ `${'$'}{base}${jsString(jsFile)}`);
            """.trimIndent()
        }
    }

    private fun jsBaseUrl(): String {
        // Optional CDN prefix support; empty string means same origin
        val base = env.getProperty("app.assets.cdnBaseUrl", "")!!.trimEnd('/')
        return if (base.isBlank()) "''" else "'$base/'"
    }

    private fun jsString(path: String): String {
        // ensure safe path for embedding
        val p = if (path.startsWith('/')) path.substring(1) else path
        val safe = URLEncoder.encode(p, StandardCharsets.UTF_8).replace("+", "%20")
        // Keep slashes; undo their encoding
        return "'/${safe.replace("%2F", "/")}'"
    }
}
