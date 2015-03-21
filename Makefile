ISTANBUL=node_modules/.bin/istanbul
UNIT_TEST_FILES=$(shell find . -name "*.spec.js" -not -path "./node_modules/*")
INT_TEST_FILES=$(shell find . -name "*.int.js" -not -path "./node_modules/*")
MOCHA_ARGS=--bail -u bdd -r test/config.js --timeout 20000
MOCHA=@./node_modules/.bin/mocha ${MOCHA_ARGS}

unit:
	${MOCHA} ${UNIT_TEST_FILES} ${ARGS}

int:
	${MOCHA} ${INT_TEST_FILES} ${ARGS}

coverage:
	$(ISTANBUL) cover node_modules/.bin/_mocha -- ${MOCHA_ARGS} ${ARGS} ${UNIT_TEST_FILES} ${INT_TEST_FILES}

viewCov:
	open coverage/lcov-report/index.html

all: unit int

.PHONY: unit int coverage viewCov all
