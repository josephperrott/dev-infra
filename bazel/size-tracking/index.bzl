# Copyright Google LLC
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary", "npm_package_bin", "nodejs_test")
load("@build_bazel_rules_nodejs//:providers.bzl", "run_node", "JSEcmaScriptModuleInfo")


def _size_tracking_impl(target, ctx):
    generated_files = []
    for provider in ctx.rule.providers:
        if hasattr(provider, "files"):
            generated_files.extend(provider.files.to_list())

    # Print the list of generated files
    print("Generated files for target '%s':" % ctx.label)
    for file in generated_files:
        print("  - %s" % file.path)

    return [DefaultInfo(files = depset())]  # No output files in this case

size_tracking_aspect = aspect(
    implementation = _size_tracking_impl,
    required_providers = [JSEcmaScriptModuleInfo]
)
