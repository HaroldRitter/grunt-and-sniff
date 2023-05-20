# Grunt and Sniff - Changelog

# [0.4.1] - 20 Mai 2023

- Minor fix: switches to the
last grunt version in the dev dependencies: 1.6.1
(fix race condition and traversal path in older
version - only for the example)

# [0.4.0] - 19 Mai 2023

- The inserted files are not saved anymore
- Fixes a few errors in examples of the README file

# [0.3.0] - 11 Mai 2023

- The ``forceDestUseStrict`` option can take an extension
as a string, an array of extensions or a boolean. Default:
``[".js"]``

# [0.2.0] - 10 Februar 2023

- Adds the ``tplContext`` feature to ``GSFileData``.
- The inclusion functions allow arguments in an object.

# [0.1.5] - 8 Februar 2023

- Removes the last empty line of the dependency list that may affect the parsing.

# [0.1.4] - 7 Februar 2023

- Adds the ``before`` inclusion.
- An error is thrown if the require syntax uses a bad require type.

# [0.1.3] - 7 Februar 2023

- Fixes the usage of ``sourceDir``

# [0.1.2] - 7 Februar 2023

- Adds the template name to the grunt warnings.

# [0.1.1] - 7 Februar 2023

- Fixes the path of the tasks