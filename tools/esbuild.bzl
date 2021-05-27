
load("@npm//@bazel/esbuild:index.bzl", _esbuild="esbuild")
load("@build_bazel_rules_nodejs//:index.bzl", "generated_file_test")


def _get_single_file_impl(ctx):
    files = ctx.attr.dependency.files

    for f in files.to_list():
      if f.basename.endswith('.js'):
        return [
            DefaultInfo(files = depset([f])),
        ]

    fail('Unable to find the single js file created by "esbuild"')

get_single_file = rule(
    attrs = {
        "dependency": attr.label(
            mandatory = True,
        )
    },
    implementation = _get_single_file_impl,
)


def esbuild(name, entry_point, save_to_repo = False, deps = []):
  _esbuild(
      name = "%s_esbuild" % name,
      entry_point = entry_point,
      deps = deps,
      tool = select({
          "@bazel_tools//src/conditions:darwin": "@esbuild_darwin//:bin/esbuild",
          "@bazel_tools//src/conditions:windows": "@esbuild_windows//:esbuild.exe",
          "@bazel_tools//src/conditions:linux_x86_64": "@esbuild_linux//:bin/esbuild",
      }),
      platform = "node",
      target = "node12",
  )

  get_single_file(
    name = name,
    dependency = ":%s_esbuild" % name,
  )

  if save_to_repo:
    generated_file_test(
        name = "generated_%s" % name,
        src = "%s.js" % name,
        generated = name,
  )
