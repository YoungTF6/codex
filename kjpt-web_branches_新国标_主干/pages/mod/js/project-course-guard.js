(function (window) {
    function normalizeBoolean(value) {
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'number') {
            return value === 1;
        }
        var text = normalizeText(value).toLowerCase();
        return text === '1' || text === 'true' || text === 't' || text === 'yes' || text === 'on';
    }

    function normalizeText(value) {
        return (value == null ? '' : String(value)).trim();
    }

    function normalizeIdCard(value) {
        return normalizeText(value).replace(/\s+/g, '').toUpperCase();
    }

    function hasCourseIdentity(course) {
        return !!(normalizeIdCard(course && course.idCardNo) || normalizeText(course && course.teacherName));
    }

    function getFeatureConfig() {
        return window.DeclarePageFeatureConfig || {};
    }

    function mergeFeatureConfig(nextConfig) {
        var prevConfig = getFeatureConfig();
        var merged = {};
        var key;
        for (key in prevConfig) {
            if (Object.prototype.hasOwnProperty.call(prevConfig, key)) {
                merged[key] = prevConfig[key];
            }
        }
        for (key in (nextConfig || {})) {
            if (Object.prototype.hasOwnProperty.call(nextConfig, key)) {
                merged[key] = nextConfig[key];
            }
        }
        window.DeclarePageFeatureConfig = merged;
        return merged;
    }

    window.ProjectDeclareCourseGuard = {
        featureKeys: {
            requirePrincipalInCourse: 'requirePrincipalInCourse'
        },
        setFeatureConfig: function (config) {
            return mergeFeatureConfig(config);
        },
        isFeatureEnabled: function (featureKey, defaultValue) {
            var config = getFeatureConfig();
            if (Object.prototype.hasOwnProperty.call(config, featureKey)) {
                return normalizeBoolean(config[featureKey]);
            }
            return normalizeBoolean(defaultValue);
        },
        shouldValidatePrincipalInCourses: function (options) {
            var opts = options || {};
            if (Object.prototype.hasOwnProperty.call(opts, 'enabled')) {
                return normalizeBoolean(opts.enabled);
            }
            return this.isFeatureEnabled(this.featureKeys.requirePrincipalInCourse, false);
        },
        validatePrincipalInCoursesIfEnabled: function (options) {
            var opts = options || {};
            if (!this.shouldValidatePrincipalInCourses(opts)) {
                return { ok: true };
            }
            return this.validatePrincipalInCourses(opts.principal, opts.courseArr);
        },
        validatePrincipalInCourses: function (principal, courseArr) {
            var principalIdCardNo = normalizeIdCard(principal && (principal.idCardNo || principal.prin_idCardNo));
            var principalName = normalizeText((principal && (principal.personName || principal.prin_personName || principal.name)));
            var courses = Array.isArray(courseArr) ? courseArr : [];

            if (!principalIdCardNo && !principalName) {
                return { ok: true };
            }

            var matched = courses.some(function (course) {
                if (!hasCourseIdentity(course)) {
                    return false;
                }
                var courseIdCardNo = normalizeIdCard(course && course.idCardNo);
                var courseTeacherName = normalizeText(course && course.teacherName);

                if (principalIdCardNo && principalName && courseTeacherName) {
                    return principalIdCardNo === courseIdCardNo && principalName === courseTeacherName;
                }

                if (principalIdCardNo && courseIdCardNo) {
                    return principalIdCardNo === courseIdCardNo;
                }

                if (principalName && courseTeacherName) {
                    return principalName === courseTeacherName;
                }

                return false;
            });

            if (matched) {
                return { ok: true };
            }

            return {
                ok: false,
                msg: '项目负责人未参与授课，请维护课程信息。'
            };
        }
    };
})(window);