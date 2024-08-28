# Copyright Google LLC
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary", "nodejs_test")
load("@build_bazel_rules_nodejs//:providers.bzl", "JSEcmaScriptModuleInfo",)


def _size_tracking_impl(ctx):
    generated_files = []
    tracked_files = []

    for dep in ctx.attr.deps:
        if JSEcmaScriptModuleInfo in dep:
            generated_files += dep[JSEcmaScriptModuleInfo].direct_sources.to_list()
    
    for src in generated_files:
        src_file_path = src.path[len(src.dirname) + 1:]
        if src.is_source == False and src_file_path in ctx.attr.tracked_files:
            tracked_files.append(src)

    script_content = """
    #!/bin/bash
    echo "This is a test"
    pwd
    ls ng-dev/utils
    """

    executable = ctx.actions.declare_file("%s.size-tracking" % ctx.label.name)
    ctx.actions.write(executable, script_content, is_executable = True)

    # The datafile must be in the runfiles for the executable to see it.
    runfiles = ctx.runfiles(files = tracked_files)

    return [DefaultInfo(executable = executable, runfiles = runfiles)]

        

size_tracking = rule(
    executable = True,
    implementation = _size_tracking_impl,
    attrs = {
        'deps' : attr.label_list(mandatory = True, providers= [[JSEcmaScriptModuleInfo]]),
        'tracked_files' : attr.string_list(mandatory = True),
    },
)