"""Routing guards for the flask-restx namespace setup.

flask-restx re-registers a namespace's resources on every ``add_namespace``
call, so registering one twice silently duplicates every rule in the URL map.
"""

from vame_app import create_app


def test_no_duplicate_url_rules():
    rules = [str(r) for r in create_app().url_map.iter_rules()]
    duplicates = {r for r in rules if rules.count(r) > 1}
    assert not duplicates, f"duplicate URL rules registered: {sorted(duplicates)}"


def test_route_modules_have_distinct_namespaces():
    """Sharing one namespace across modules re-registers every route per module."""
    from vame_app.routes import (
        community,
        file,
        fs,
        gpu_check,
        health_check,
        model,
        pose_segmentation,
        preprocessing,
        project,
        report,
        vame,
    )

    modules = [
        health_check,
        file,
        project,
        vame,
        preprocessing,
        model,
        pose_segmentation,
        community,
        report,
        gpu_check,
        fs,
    ]
    names = [m.api.name for m in modules]
    assert len({id(m.api) for m in modules}) == len(modules), f"shared namespace: {names}"
    assert len(set(names)) == len(names), f"duplicate namespace names: {names}"


def test_api_routes_stay_at_root():
    """The frontend calls these unprefixed; a namespace path would break it."""
    paths = {str(r) for r in create_app().url_map.iter_rules()}
    for path in ("/connected", "/ready", "/projects", "/load", "/gpu-check"):
        assert path in paths, f"{path} moved or disappeared"
