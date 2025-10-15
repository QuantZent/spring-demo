package com.example.spring.utils

data class ManifestEntry(
    val src: String? = null,
    val file: String,
    val css: List<String>? = null,
    val assets: List<String>? = null,
    val isEntry: Boolean? = null,
    val name: String? = null,
    val names: List<String>? = null,
    val isDynamicEntry: Boolean? = null,
    val imports: List<String>? = null,
    val dynamicImports: List<String>? = null
)

