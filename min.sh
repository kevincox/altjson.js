src='altjson.js'
dest='altjson.min.js'

#debug='--debug --formatting PRETTY_PRINT'

if which uglifyjs &>/dev/null ; then
	m="$(uglifyjs "$src" -cm --screw-ie8 \
	               --source-map url.min.js.map --source-map-include-sources
	    )"
elif which closure &>/dev/null ; then
	m="$(closure --language_in ECMASCRIPT5_STRICT --js "$src" \
	             $debug \
	             --compilation_level SIMPLE_OPTIMIZATIONS \
	             --create_source_map url.min.js.map --source_map_format V3
	    )"
else
	echo "Error: No minifier found.  Copping to dest."
	m="$(cat "$src")"
fi

echo "$m" > "$dest"
